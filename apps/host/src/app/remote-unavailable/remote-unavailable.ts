import { Component } from '@angular/core';
import { Button } from '@enterprise/shared/ui';

@Component({
  selector: 'app-remote-unavailable',
  imports: [Button],
  templateUrl: './remote-unavailable.html',
  styleUrl: './remote-unavailable.scss',
})
export class RemoteUnavailable {
  protected reload(): void {
    location.reload();
  }
}
