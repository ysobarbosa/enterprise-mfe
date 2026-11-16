import { initFederation } from '@angular-architects/native-federation';
import type { RemoteLoader } from './app/remote-loader';

initFederation('federation.manifest.json', {
  hostRemoteEntry: { url: './remoteEntry.json' },
})
  .then((federation): RemoteLoader => federation.loadRemoteModule)
  .catch((error: unknown): RemoteLoader => {
    // The shell must start even when federation cannot initialise; remote
    // routes then fall back to the "unavailable" page.
    console.error(error);
    return () => Promise.reject(error);
  })
  .then((loadRemote) => import('./bootstrap').then((m) => m.bootstrap(loadRemote)))
  .catch((error) => console.error(error));
