import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { Product, ProductsResponse } from './product';
import { GetProductsParams, ProductsApi } from './products-api';
import { ProductsStore } from './products-store';

class FakeProductsApi {
  readonly calls: GetProductsParams[] = [];
  private readonly pending: Subject<ProductsResponse>[] = [];

  getProducts(params: GetProductsParams): Observable<ProductsResponse> {
    this.calls.push(params);
    const response = new Subject<ProductsResponse>();
    this.pending.push(response);
    return response.asObservable();
  }

  respond(callIndex: number, products: Product[], total: number): void {
    const { skip = 0, limit = 30 } = this.calls[callIndex];
    this.pending[callIndex].next({ products, total, skip, limit });
    this.pending[callIndex].complete();
  }

  fail(callIndex: number, error: unknown): void {
    this.pending[callIndex].error(error);
  }
}

function createProducts(count: number, firstId = 1): Product[] {
  return Array.from({ length: count }, (_, i) => ({ id: firstId + i }) as Product);
}

describe('ProductsStore', () => {
  let store: ProductsStore;
  let api: FakeProductsApi;

  beforeEach(() => {
    api = new FakeProductsApi();
    TestBed.configureTestingModule({
      providers: [{ provide: ProductsApi, useValue: api }],
    });
    store = TestBed.inject(ProductsStore);
  });

  it('starts empty and does not fetch until loadMore is called', () => {
    expect(store.products()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.hasMore()).toBe(true);
    expect(api.calls).toHaveLength(0);
  });

  it('loads the first page from skip 0', () => {
    store.loadMore();

    expect(api.calls).toEqual([{ limit: 30, skip: 0 }]);
    expect(store.loading()).toBe(true);

    api.respond(0, createProducts(30), 194);

    expect(store.products()).toHaveLength(30);
    expect(store.total()).toBe(194);
    expect(store.loading()).toBe(false);
  });

  it('appends the next page using the loaded count as skip', () => {
    store.loadMore();
    api.respond(0, createProducts(30, 1), 194);

    store.loadMore();
    expect(api.calls[1]).toEqual({ limit: 30, skip: 30 });
    api.respond(1, createProducts(30, 31), 194);

    expect(store.products()).toHaveLength(60);
    expect(store.products()[30].id).toBe(31);
  });

  it('ignores loadMore while a page is loading', () => {
    store.loadMore();
    store.loadMore();
    store.loadMore();

    expect(api.calls).toHaveLength(1);
  });

  it('keeps loaded products on error and retries the same page', () => {
    store.loadMore();
    api.respond(0, createProducts(30), 194);

    store.loadMore();
    api.fail(1, new Error('network down'));

    expect(store.products()).toHaveLength(30);
    expect(store.error()).toBeInstanceOf(Error);
    expect(store.loading()).toBe(false);

    store.loadMore();
    expect(api.calls[2]).toEqual({ limit: 30, skip: 30 });
    expect(store.error()).toBeNull();
  });

  it('stops requesting once every product is loaded', () => {
    store.loadMore();
    api.respond(0, createProducts(30), 30);

    expect(store.hasMore()).toBe(false);
    store.loadMore();
    expect(api.calls).toHaveLength(1);
  });
});
