import { Route } from '@angular/router';

// Public contract of the catalog micro frontend: the host mounts these routes
// through Native Federation (exposed as './routes' in federation.config.mjs).
export const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./products/products-page').then((m) => m.ProductsPage),
  },
];
