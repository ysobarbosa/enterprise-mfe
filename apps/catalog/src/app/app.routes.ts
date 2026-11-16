import { Route } from '@angular/router';
import { routes } from './remote.routes';

// Standalone mode (catalog served on its own) uses the same routes it exposes.
export const appRoutes: Route[] = routes;
