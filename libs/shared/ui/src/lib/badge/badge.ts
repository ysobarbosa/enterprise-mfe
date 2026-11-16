import { Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'ui-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  host: {
    class: 'ui-badge',
    '[attr.data-tone]': 'tone()',
  },
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
}
