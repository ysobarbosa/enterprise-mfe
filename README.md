# Enterprise MFE

Monorepo **Nx + Angular** com arquitetura de **microfrontends** (Host + Catalog), consumindo a API pública do [DummyJSON](https://dummyjson.com).

É um projeto de estudo: a ideia é construir, passo a passo, uma base no estilo "enterprise" e registrar **o porquê** de cada decisão, não só o resultado. Cada etapa vira um commit pequeno, e este README é atualizado conforme o projeto avança.

## A ideia

Uma vitrine de produtos dividida em duas aplicações independentes:

- **Host:** a casca da aplicação (layout, navegação). Carrega os microfrontends em tempo de execução.
- **Catalog:** o microfrontend da listagem de produtos, com scroll infinito.

As duas compartilham código por meio de **libs** do monorepo:

- **`shared/data-access`:** acesso à API e estado (RxJS + Signals).
- **`shared/ui`:** Design System, com componentes visuais desacoplados das regras de negócio.

```mermaid
flowchart TD
    host["apps/host<br/>(shell)"]
    catalog["apps/catalog<br/>(microfrontend, Fase 5)"]
    ui["libs/shared/ui<br/>@enterprise/shared/ui"]
    data["libs/shared/data-access<br/>@enterprise/shared/data-access"]
    api[("DummyJSON API")]

    host -. "Module Federation (Fase 5)" .-> catalog
    host --> ui
    catalog --> ui
    catalog --> data
    data --> api
```

## Stack

| Ferramenta | Versão | Uso |
|---|---|---|
| Nx | 23.3 | Monorepo, geradores, cache e grafo de dependências |
| Angular | 22.1 | Standalone Components, Signals, change detection `OnPush` |
| TypeScript | 6.0 | `strict` ligado nas libs |
| RxJS | 7.8 | Requisições HTTP e controle de concorrência |
| Jest | 30 | Testes unitários |
| Cypress | 16 | Testes e2e |
| Node | 24 | Runtime |

## Estrutura

```
apps/
  host/                  # aplicação shell
  host-e2e/              # testes e2e (Cypress) do host
libs/
  shared/
    ui/                  # @enterprise/shared/ui (componentes e src/styles/theme.scss)
    data-access/         # @enterprise/shared/data-access
      src/lib/products/  # modelos e cliente da API de produtos
```

As libs são importadas sempre pelo alias (`@enterprise/...`), nunca por caminho relativo. Os aliases ficam em `paths` no `tsconfig.base.json` e são criados pelos geradores do Nx. Cada lib expõe apenas o que está no seu `src/index.ts`.

## Como rodar

Pré-requisitos: Node 24 e npm.

```bash
npm ci
```

| Tarefa | Comando |
|---|---|
| Servidor de desenvolvimento (http://localhost:4200) | `npx nx serve host` |
| Build de produção | `npx nx build host` |
| Testes do host | `npx nx test host` |
| Testes de uma lib | `npx nx test shared-ui` / `npx nx test shared-data-access` |
| Todos os testes | `npx nx run-many -t test` |
| Lint | `npx nx run-many -t lint` |
| Grafo de dependências | `npx nx graph` |

## Progresso

- [x] **Fase 1: base do workspace.** Workspace Nx criado, componente de exemplo removido, build e testes verdes.
- [x] **Fase 2: libs compartilhadas.** `shared/ui` e `shared/data-access` geradas com o Nx; alias `@enterprise/shared/ui` validado no build, no Jest e no grafo do Nx.
- [x] **Fase 3: camada de dados**
  - [x] Modelos de produto tipados a partir da resposta real da API
  - [x] `ProductsApi`: cliente HTTP paginado, com testes
  - [x] `ProductsStore`: estado com Signals e scroll infinito, com testes
  - [x] Consumo no host, com o alias `@enterprise/shared/data-access` validado no build, no Jest e no grafo do Nx
- [x] **Fase 4: Design System** em `shared/ui`
  - [x] Fronteiras entre camadas garantidas pelo ESLint (tags `type:*` e `scope:*`)
  - [x] Tokens de design (cores, tipografia, raios, sombras, movimento) como variáveis CSS
  - [x] Componentes `Button`, `Badge` e `Card` e diretiva `InfiniteScroll`, com testes
  - [x] Vitrine "Maison Rosé" no host, com scroll infinito automático
- [ ] **Fase 5: microfrontend Catalog** integrado ao Host via Module Federation.

## Decisões-chave

### Monorepo e libs
- **Libs não buildable:** o host compila o código-fonte das libs direto, via `paths`. É mais simples para libs internas e facilita o compartilhamento no Module Federation.
- **Geradores do Nx sempre que existirem**, para criar libs e aliases de forma consistente. Os defaults do gerador foram fixados no `nx.json` (Jest, ESLint, SCSS). Na versão instalada, o padrão de testes para libs não buildable seria Vitest, e o monorepo usa Jest.
- **`strict` só nas libs, por enquanto:** código novo já nasce com tipagem rigorosa; ligar o `strict` no restante do workspace é uma tarefa separada.
- **API pública explícita:** o `index.ts` de cada lib usa exports nomeados (`export type` para tipos) em vez de `export *`, para que nada interno vaze por acidente.
- **Webpack no host (em vez de esbuild),** de propósito: é o caminho para o Module Federation da Fase 5.

### Camada de dados (Fase 3)
- **Tipos conferidos contra a API real:** `brand` falta em cerca de metade dos produtos, então é opcional; `availabilityStatus` é um union dos três valores que a API devolve. Todos os campos são `readonly`.
- **`@Service()` em vez de `@Injectable`:** é o padrão do Angular 22. O serviço se registra sozinho na injeção de dependências, e as dependências entram via `inject()`.
- **Sem `provideHttpClient()`:** no Angular 22, o `HttpClient` já é fornecido no root e usa `fetch` por padrão.
- **API e estado separados:** o `ProductsApi` só descreve a requisição (devolve um `Observable` e repassa erros); o `ProductsStore` guarda o estado e decide quando buscar.
- **O store é a única porta de entrada:** a lib exporta os tipos de produto e o `ProductsStore`; o `ProductsApi` é interno. Assim, nenhuma tela consegue montar uma lista paralela à do store, e a implementação HTTP pode mudar sem quebrar quem consome.
- **Scroll infinito com `exhaustMap`:** novos pedidos de "carregar mais" são ignorados enquanto uma carga está em andamento, o que evita páginas perdidas ou duplicadas. O `skip` vem sempre da quantidade de itens já carregados, então uma nova tentativa depois de um erro repete a mesma página.
- **Detectar o fim da rolagem é papel da UI:** um `IntersectionObserver` numa diretiva da `shared/ui`. O store só expõe `loadMore()` e `hasMore()`, e é testável sem DOM.
- **Página de produtos no host, por enquanto:** a `ProductsPage` valida a camada de dados de ponta a ponta e vai para o Catalog na Fase 5. Até lá, o host depende de `shared/data-access`, o que o diagrama acima ainda não mostra.
- **Rota lazy com `loadComponent`:** a página sai num chunk próprio (22,88 kB), pelo mesmo tipo de rota que deve receber o Catalog. Ligar a primeira rota aumentou o bundle inicial de 205,96 kB para 373,95 kB (cerca de 50 kB a mais em transferência). Medimos isso comparando builds com e sem a rota, e aceitamos o custo porque o host precisa de rotas de qualquer forma.

### Design System (Fase 4)
- **Fronteiras garantidas por ferramenta:** cada projeto tem tags de camada (`type:app`, `type:ui`, `type:data-access`) e de escopo (`scope:shared`, `scope:host`). O ESLint barra, por exemplo, um import de `shared/data-access` dentro de `shared/ui`, o que foi comprovado com um import proibido de teste.
- **Componentes sem domínio:** a `shared/ui` não conhece produtos. O `Card` recebe mídia e conteúdo por projeção, e o `Badge` recebe um tom (`success`, `warning`...). Traduzir "Low Stock" em "Últimas unidades" com tom de alerta é papel do app.
- **Tokens como variáveis CSS:** a paleta (marfim, rosa queimado claro e tinta ameixa), as fontes (Cormorant Garamond e Jost), os raios, as sombras e as curvas de animação ficam num tema global da lib, que cada app carrega. Os componentes só leem as variáveis.
- **`Button` sobre o elemento nativo:** o seletor é de atributo (`button[uiButton]`), para manter foco, teclado e acessibilidade do `<button>`. A regra de lint que exige seletor de elemento tem uma exceção justificada nessa linha.
- **Diretiva só detecta, não carrega:** a `InfiniteScroll` emite `reached` quando a sentinela se aproxima da tela, e a página chama `loadMore()`. Ela recria o observador a cada reativação, então, se a sentinela continuar visível depois de uma carga, a próxima página vem sem precisar rolar.
- **Sem auto-retry em erro:** com erro, a sentinela some e aparece o botão "Tentar de novo". Se ela continuasse ativa, o erro dispararia novas tentativas em sequência.
- **Movimento discreto:** os cards entram com um leve deslize, sobem no hover e ampliam a imagem; tudo é desligado para quem pede menos movimento no sistema (`prefers-reduced-motion`).
- **Sem Storybook, por ora:** os componentes são vistos no próprio host.

### Testes
- **Sem rede nos testes:** chamadas HTTP são interceptadas com `HttpTestingController`.
- **Store testado com um dublê controlado:** o `ProductsApi` é substituído por um dublê cujas respostas só chegam quando o teste manda, o que permite testar o que acontece *durante* uma carga. Um teste de mutação (trocar `exhaustMap` por `mergeMap`) confirmou que a garantia de "uma carga por vez" é coberta por um teste.
- **Página testada com o store real:** só o HTTP é interceptado, então a spec cobre página, store e API juntos, verificando o que o usuário vê na tela.
- **Diretiva testada com um `IntersectionObserver` falso:** o ambiente de DOM do Jest não tem um, então o teste decide quando a sentinela "entra na tela".
