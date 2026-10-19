import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ProductsResponse } from './product';
import { ProductsApi } from './products-api';

const PRODUCTS_URL = 'https://dummyjson.com/products';

describe('ProductsApi', () => {
  let api: ProductsApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    api = TestBed.inject(ProductsApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests the first page with default pagination', async () => {
    const response: ProductsResponse = { products: [], total: 194, skip: 0, limit: 30 };
    const result = firstValueFrom(api.getProducts());

    const req = httpTesting.expectOne((r) => r.url === PRODUCTS_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('30');
    expect(req.request.params.get('skip')).toBe('0');
    req.flush(response);

    await expect(result).resolves.toEqual(response);
  });

  it('forwards custom pagination', async () => {
    const result = firstValueFrom(api.getProducts({ limit: 10, skip: 20 }));

    const req = httpTesting.expectOne((r) => r.url === PRODUCTS_URL);
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('skip')).toBe('20');
    req.flush({ products: [], total: 194, skip: 20, limit: 10 });

    await result;
  });

  it('propagates HTTP errors to the caller', async () => {
    const result = firstValueFrom(api.getProducts());

    httpTesting
      .expectOne((r) => r.url === PRODUCTS_URL)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await expect(result).rejects.toMatchObject({ status: 500 });
  });
});
