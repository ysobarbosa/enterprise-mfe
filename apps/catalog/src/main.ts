import { initFederation } from '@angular-architects/native-federation';

initFederation(
  {},
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .catch((error) => console.error(error))
  .then(() => import('./bootstrap'))
  .catch((error) => console.error(error));
