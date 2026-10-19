import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsResponse } from './product';

export interface GetProductsParams {
  readonly limit?: number;
  readonly skip?: number;
}

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';

@Service()
export class ProductsApi {
  private readonly http = inject(HttpClient);

  getProducts({ limit = 30, skip = 0 }: GetProductsParams = {}): Observable<ProductsResponse> {
    const params = new HttpParams().set('limit', limit).set('skip', skip);
    return this.http.get<ProductsResponse>(`${DUMMYJSON_BASE_URL}/products`, { params });
  }
}
