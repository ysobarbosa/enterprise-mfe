import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Product } from '@enterprise/shared/data-access';
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
  const button = () => element().querySelector('button');
  const expectRequest = () => httpTesting.expectOne((r) => r.url === PRODUCTS_URL);

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

  it('requests the first page on creation and shows the loading state', () => {
    expect(expectRequest().request.params.get('skip')).toBe('0');
    expect(button()?.textContent).toContain('Carregando');
    expect(button()?.disabled).toBe(true);
  });

  it('renders the loaded products and the total', () => {
    respond(createProducts(30), 194);

    expect(items()).toHaveLength(30);
    expect(items()[0].textContent).toContain('Product 1');
    expect(element().textContent).toContain('30 de 194 produtos');
    expect(button()?.textContent).toContain('Carregar mais');
    expect(button()?.disabled).toBe(false);
  });

  it('shows a fallback for products without a brand', () => {
    const [product] = createProducts(1);
    respond([{ ...product, brand: undefined }], 1);

    expect(items()[0].textContent).toContain('sem marca');
  });

  it('appends the next page when the button is clicked', () => {
    respond(createProducts(30), 194);

    button()?.click();
    const next = expectRequest();
    expect(next.request.params.get('skip')).toBe('30');
    next.flush({ products: createProducts(30, 31), total: 194, skip: 30, limit: 30 });
    fixture.detectChanges();

    expect(items()).toHaveLength(60);
  });

  it('keeps the list on error and retries the same page', () => {
    respond(createProducts(30), 194);

    button()?.click();
    expectRequest().flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(items()).toHaveLength(30);
    expect(element().querySelector('[role="alert"]')).not.toBeNull();
    expect(button()?.textContent).toContain('Tentar de novo');

    button()?.click();
    expect(expectRequest().request.params.get('skip')).toBe('30');
  });

  it('hides the button once every product is loaded', () => {
    respond(createProducts(30), 30);

    expect(button()).toBeNull();
  });
});
