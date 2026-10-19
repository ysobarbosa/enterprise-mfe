import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedUi } from '@enterprise/shared/ui';

@Component({
  imports: [RouterModule, SharedUi],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'host';
}
