import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Minimal shell used only when the catalog runs standalone; inside the host,
// the host's own layout wraps the exposed routes instead.
@Component({
  imports: [RouterModule],
  selector: 'catalog-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
