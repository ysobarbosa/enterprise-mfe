# Decisões técnicas

Registro completo das decisões do projeto, fase a fase, com o motivo de cada uma. O [README](../README.md) traz o resumo.

## Monorepo e libs
- **Libs não buildable:** os apps compilam o código-fonte das libs direto, via `paths`. É mais simples para libs internas, e o Native Federation compartilha o código delas entre host e catalog.
- **Geradores do Nx sempre que existirem**, para criar libs, apps e componentes de forma consistente. Os defaults foram fixados no `nx.json` (Jest, ESLint, SCSS): na versão instalada, o padrão de testes para libs não buildable seria Vitest, e o padrão de e2e seria Playwright.
- **`strict` só nas libs, por enquanto:** código novo já nasce com tipagem rigorosa; ligar o `strict` no restante do workspace é uma tarefa separada.
- **API pública explícita:** o `index.ts` de cada lib usa exports nomeados (`export type` para tipos) em vez de `export *`, para que nada interno vaze por acidente.
- **Fronteiras garantidas por ferramenta:** cada projeto tem tags de camada (`type:app`, `type:ui`, `type:data-access`) e de escopo (`scope:shared`, `scope:host`, `scope:catalog`). A regra `@nx/enforce-module-boundaries` barra, por exemplo, um import de `shared/data-access` dentro de `shared/ui`, o que foi comprovado com um import proibido de teste.

## Camada de dados
- **Tipos conferidos contra a API real:** os 194 produtos foram baixados e inspecionados. `brand` falta em 92 deles, então é opcional; `availabilityStatus` é um union dos três valores que a API devolve. Todos os campos são `readonly`.
- **`@Service()` em vez de `@Injectable`:** é o padrão do schematic do Angular 22. O serviço se registra sozinho na injeção de dependências, e as dependências entram via `inject()`. O comportamento foi confirmado em teste, não presumido.
- **Sem `provideHttpClient()`:** no Angular 22, o `HttpClient` já é fornecido no root e usa `fetch` por padrão (lido nas tipagens do `@angular/common`).
- **API e estado separados:** o `ProductsApi` só descreve a requisição (devolve um `Observable` e repassa erros); o `ProductsStore` guarda o estado e decide quando buscar.
- **O store é a única porta de entrada:** a lib exporta os tipos de produto e o `ProductsStore`; o `ProductsApi` é interno. Nenhuma tela consegue montar uma lista paralela à do store, e a implementação HTTP pode mudar sem quebrar quem consome.
- **Estado num único signal:** `{ products, total, status, error }`. Os itens ficam fora do `status` porque, no scroll infinito, carregamento e erro acontecem com itens já na tela.
- **Scroll infinito com `exhaustMap`:** novos pedidos de "carregar mais" são ignorados enquanto uma carga está em andamento. Um `switchMap` cancelaria a carga e perderia páginas; um `mergeMap` buscaria a mesma página duas vezes.
- **`skip` derivado dos itens carregados:** o próximo `skip` é sempre `products.length`. Uma nova tentativa depois de um erro repete exatamente a mesma página, sem lógica extra.
- **`catchError` dentro do `exhaustMap`:** o erro vira estado e o fluxo principal continua vivo para o próximo `loadMore()`.

## Design System
- **Componentes sem domínio:** a `shared/ui` não conhece produtos. O `Card` recebe mídia e conteúdo por projeção, e o `Badge` recebe um tom (`success`, `warning`...). Traduzir "Low Stock" em "Últimas unidades" com tom de alerta é papel do app.
- **Tokens como variáveis CSS:** paleta (marfim, rosa queimado claro e tinta ameixa), fontes (Cormorant Garamond e Jost), raios, sombras e curvas de animação ficam num tema global da lib, que cada app carrega. Os componentes só leem as variáveis.
- **`Button` sobre o elemento nativo:** o seletor é de atributo (`button[uiButton]`), para manter foco, teclado e acessibilidade do `<button>`. A regra de lint que exige seletor de elemento tem uma exceção justificada nessa linha.
- **Diretiva só detecta, não carrega:** a `InfiniteScroll` emite `reached` quando a sentinela se aproxima da tela, e a página chama `loadMore()`. Ela recria o `IntersectionObserver` a cada reativação: se a sentinela continuar visível depois de uma carga, a próxima página vem sem precisar rolar.
- **Sem auto-retry em erro:** com erro, a sentinela some e aparece o botão "Tentar de novo". Se ela continuasse ativa, o erro dispararia novas tentativas em sequência.
- **Movimento discreto e acessível:** cards entram com um leve deslize, sobem no hover e ampliam a imagem; tudo é desligado com `prefers-reduced-motion`.
- **Duas colunas no celular:** uma coluna deixava um produto por tela, sem cara de vitrine.

## Microfrontends
- **Native Federation em vez do Module Federation do Nx:** no Nx 23, os geradores de Module Federation para Angular estão deprecados e saem no Nx 24. A recomendação oficial é o `@angular-architects/native-federation`, que roda sobre o builder esbuild do Angular. A versão 22.1 foi escolhida por casar com o Angular 22.1 do projeto.
- **Migração do host para o esbuild:** feita com o gerador `convert-to-application-executor` do Nx. Além de habilitar a federação, eliminou o aviso de builder deprecado. O bundle inicial do host caiu de 385,89 kB para 269,86 kB antes da federação.
- **Dynamic host com manifesto:** o endereço do catalog fica num JSON lido em tempo de execução (`federation.manifest.json`). Trocar o endereço de um microfrontend não exige rebuild do host.
- **O catalog expõe rotas, não componentes:** o contrato é `./routes`. O catalog decide suas próprias páginas; o host só decide *onde* montá-las.
- **Carregador via injeção de dependência:** o `loadRemoteModule` avulso está deprecado. O host usa o carregador devolvido pelo `initFederation` e o entrega às rotas por um `InjectionToken`, o que permite testar a rota com um carregador falso.
- **Host resiliente:** se a federação não inicializar ou o catalog não responder, o host sobe mesmo assim e mostra uma página de aviso com botão para tentar de novo. Testado bloqueando o catalog.
- **Catalog também roda sozinho:** em `localhost:4201`, com uma casca mínima e o mesmo tema.
- **Singletons compartilhados:** Angular, RxJS e as libs do monorepo são compartilhados entre host e catalog, então há uma única instância do `ProductsStore`.

## Performance
- **Medida no build de produção com Lighthouse,** não no servidor de desenvolvimento.
- **CLS de 0,813 → 0:** o `<main>` centralizado pulava de lado quando a barra de rolagem aparecia. Corrigido com `scrollbar-gutter: stable`. O rodapé também pulava quando a vitrine chegava: o `<main>` ganhou altura mínima de uma tela.
- **LCP:** as 4 primeiras imagens (a primeira linha da vitrine) carregam com prioridade alta, sem `loading="lazy"`; `preconnect` para a API e o CDN de imagens.
- **Custo da primeira rota medido:** ainda com webpack, ligar a primeira rota lazy aumentou o bundle inicial de 205,96 kB para 373,95 kB. Medido com e sem a rota; aceito porque o host precisa de rotas.
- **Trade-off conhecido no celular:** sob a rede 4G simulada do Lighthouse, a cadeia da federação (manifesto → `remoteEntry` → módulos compartilhados → rotas → página → API → imagens) deixa o LCP alto. Próximos passos: pré-carregar o `remoteEntry`, hospedar as fontes no projeto e avaliar SSR.

## Testes
- **Sem rede nos testes:** chamadas HTTP são interceptadas com `HttpTestingController`.
- **Store testado com um dublê controlado:** as respostas do `ProductsApi` falso só chegam quando o teste manda, o que permite testar o que acontece *durante* uma carga.
- **Teste de mutação manual:** trocar `exhaustMap` por `mergeMap` faz falhar o teste "ignora pedidos durante a carga", provando que a garantia está coberta.
- **Página testada com o store real:** só o HTTP é interceptado; a spec verifica o que o usuário vê na tela.
- **Diretiva testada com um `IntersectionObserver` falso:** o ambiente de DOM do Jest não tem um, então o teste decide quando a sentinela "entra na tela".
- **Rota remota testada com carregador falso:** cobre o carregamento das rotas do catalog e o fallback quando ele falha.
