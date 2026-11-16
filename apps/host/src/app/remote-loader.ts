import { InjectionToken } from '@angular/core';

export type RemoteLoader = (remoteName: string, exposedModule: string) => Promise<unknown>;

// The loader returned by initFederation (see main.ts), provided through DI so
// routes and tests do not rely on the deprecated module-scoped loadRemoteModule.
export const REMOTE_LOADER = new InjectionToken<RemoteLoader>('REMOTE_LOADER');
