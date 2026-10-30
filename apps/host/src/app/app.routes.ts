import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./products/products-page').then((m) => m.ProductsPage),
  },
];
