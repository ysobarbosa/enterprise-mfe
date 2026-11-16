import { inject } from '@angular/core';
import { Route } from '@angular/router';
import { RemoteUnavailable } from './remote-unavailable/remote-unavailable';
import { REMOTE_LOADER } from './remote-loader';

// The catalog micro frontend exposes './routes' (see apps/catalog/federation.config.mjs).
// The host never imports catalog code directly: it only knows the remote's name
// from federation.manifest.json and the shape of what it exposes.
export function loadCatalogRoutes(): Promise<Route[]> {
  return inject(REMOTE_LOADER)('catalog', './routes')
    .then((remote) => (remote as { routes: Route[] }).routes)
    .catch((error: unknown) => {
      console.error('Catalog micro frontend unavailable', error);
      return [{ path: '**', component: RemoteUnavailable }];
    });
}

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: loadCatalogRoutes,
  },
];
