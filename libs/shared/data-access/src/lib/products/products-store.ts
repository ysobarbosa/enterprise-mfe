import { computed, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, exhaustMap, Observable, Subject, tap } from 'rxjs';
import { Product, ProductsResponse } from './product';
import { ProductsApi } from './products-api';

const PAGE_SIZE = 30;

interface ProductsState {
  readonly products: readonly Product[];
  readonly total: number | null; // null until the first response arrives
  readonly status: 'idle' | 'loading' | 'error';
  readonly error: unknown;
}

const initialState: ProductsState = { products: [], total: null, status: 'idle', error: null };

@Service()
export class ProductsStore {
  private readonly api = inject(ProductsApi);
  private readonly state = signal<ProductsState>(initialState);
  private readonly loadMoreRequests = new Subject<void>();

  readonly products = computed(() => this.state().products);
  readonly total = computed(() => this.state().total);
  readonly loading = computed(() => this.state().status === 'loading');
  readonly error = computed(() => this.state().error);
  readonly hasMore = computed(() => {
    const { total, products } = this.state();
    return total === null || products.length < total;
  });

  constructor() {
    this.loadMoreRequests
      .pipe(
        exhaustMap(() => this.fetchNextPage()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  loadMore(): void {
    if (this.hasMore()) {
      this.loadMoreRequests.next();
    }
  }

  private fetchNextPage(): Observable<ProductsResponse> {
    this.state.update((s) => ({ ...s, status: 'loading', error: null }));

    return this.api.getProducts({ limit: PAGE_SIZE, skip: this.state().products.length }).pipe(
      tap((response) =>
        this.state.update((s) => ({
          products: [...s.products, ...response.products],
          total: response.total,
          status: 'idle',
          error: null,
        })),
      ),
      catchError((error: unknown) => {
        this.state.update((s) => ({ ...s, status: 'error', error }));
        return EMPTY;
      }),
    );
  }
}
