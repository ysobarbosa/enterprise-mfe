import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Product } from '@enterprise/shared/data-access';
import { InfiniteScroll } from '@enterprise/shared/ui';
import { ProductsPage } from './products-page';

const PRODUCTS_URL = 'https://dummyjson.com/products';

function createProducts(count: number, firstId = 1): Product[] {
  return Array.from(
    { length: count },
    (_, i) =>
      ({
        id: firstId + i,
        title: `Product ${firstId + i}`,
        brand: 'Acme',
        price: 10,
        thumbnail: '',
        availabilityStatus: 'In Stock',
      }) as Product,
  );
}

describe('ProductsPage', () => {
  let fixture: ComponentFixture<ProductsPage>;
  let httpTesting: HttpTestingController;

  const element = () => fixture.nativeElement as HTMLElement;
  const items = () => element().querySelectorAll('li');
  const loader = () => element().querySelector('.loader');
  const expectRequest = () => httpTesting.expectOne((r) => r.url === PRODUCTS_URL);
  // jsdom has no IntersectionObserver, so tests fire the directive's output directly.
  const sentinel = () => fixture.debugElement.query(By.directive(InfiniteScroll));
  const reachEnd = () => {
    sentinel().injector.get(InfiniteScroll).reached.emit();
    fixture.detectChanges();
  };

  function respond(products: Product[], total: number): void {
    expectRequest().flush({ products, total, skip: 0, limit: 30 });
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests the first page on creation and shows the loader', () => {
    expect(expectRequest().request.params.get('skip')).toBe('0');
    expect(loader()).not.toBeNull();
  });

  it('renders the loaded products as cards with the total', () => {
    respond(createProducts(30), 194);

    expect(items()).toHaveLength(30);
    expect(element().querySelectorAll('ui-card')).toHaveLength(30);
    expect(items()[0].textContent).toContain('Product 1');
    expect(element().textContent).toContain('30 de 194 peças');
    expect(loader()).toBeNull();
  });

  it('maps availability to a badge label and tone', () => {
    const [product] = createProducts(1);
    respond([{ ...product, availabilityStatus: 'Low Stock' }], 1);

    const badge = element().querySelector('ui-badge');
    expect(badge?.textContent).toContain('Últimas unidades');
    expect(badge?.getAttribute('data-tone')).toBe('warning');
  });

  it('shows a fallback for products without a brand', () => {
    const [product] = createProducts(1);
    respond([{ ...product, brand: undefined }], 1);

    expect(items()[0].textContent).toContain('Seleção da casa');
  });

  it('appends the next page when the end of the list is reached', () => {
    respond(createProducts(30), 194);

    reachEnd();
    const next = expectRequest();
    expect(next.request.params.get('skip')).toBe('30');
    next.flush({ products: createProducts(30, 31), total: 194, skip: 30, limit: 30 });
    fixture.detectChanges();

    expect(items()).toHaveLength(60);
  });

  it('keeps the list on error and offers a retry of the same page', () => {
    respond(createProducts(30), 194);

    reachEnd();
    expectRequest().flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(items()).toHaveLength(30);
    expect(element().querySelector('[role="alert"]')).not.toBeNull();
    expect(sentinel()).toBeNull();

    element().querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    expect(expectRequest().request.params.get('skip')).toBe('30');
  });

  it('shows the end message once every product is loaded', () => {
    respond(createProducts(30), 30);

    expect(sentinel()).toBeNull();
    expect(element().textContent).toContain('Você viu toda a coleção');
  });
});
