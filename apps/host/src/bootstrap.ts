import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { REMOTE_LOADER, RemoteLoader } from './app/remote-loader';

export function bootstrap(loadRemote: RemoteLoader) {
  return bootstrapApplication(App, {
    ...appConfig,
    providers: [...appConfig.providers, { provide: REMOTE_LOADER, useValue: loadRemote }],
  });
}
