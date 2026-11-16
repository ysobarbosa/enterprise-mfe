import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Route } from '@angular/router';
import { loadCatalogRoutes } from './app.routes';
import { REMOTE_LOADER, RemoteLoader } from './remote-loader';
import { RemoteUnavailable } from './remote-unavailable/remote-unavailable';

@Component({ template: '' })
class FakeCatalogPage {}

function load(loader: RemoteLoader): Promise<Route[]> {
  TestBed.configureTestingModule({
    providers: [{ provide: REMOTE_LOADER, useValue: loader }],
  });
  return TestBed.runInInjectionContext(() => loadCatalogRoutes());
}

describe('loadCatalogRoutes', () => {
  it('loads the routes exposed by the catalog remote', async () => {
    const remoteRoutes: Route[] = [{ path: '', component: FakeCatalogPage }];
    const loader = jest.fn<Promise<unknown>, [string, string]>().mockResolvedValue({ routes: remoteRoutes });

    await expect(load(loader)).resolves.toBe(remoteRoutes);
    expect(loader).toHaveBeenCalledWith('catalog', './routes');
  });

  it('falls back to the unavailable page when the remote cannot be loaded', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const loader: RemoteLoader = () => Promise.reject(new Error('offline'));

    const routes = await load(loader);

    expect(routes).toEqual([{ path: '**', component: RemoteUnavailable }]);
  });
});
