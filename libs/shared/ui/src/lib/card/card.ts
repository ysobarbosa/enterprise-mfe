import { booleanAttribute, Component, input } from '@angular/core';

// Content-agnostic surface: consumers project media (marked with uiCardMedia)
// and body content, so the design system never depends on domain types.
@Component({
  selector: 'ui-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  host: {
    class: 'ui-card',
    '[class.ui-card--interactive]': 'interactive()',
  },
})
export class Card {
  readonly interactive = input(false, { transform: booleanAttribute });
}
