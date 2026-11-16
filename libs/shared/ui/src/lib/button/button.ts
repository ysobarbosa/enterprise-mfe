import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline';

// Attribute selector keeps the native <button>/<a> element, so focus,
// keyboard and screen-reader behaviour come from the platform.
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- attribute selector keeps native semantics
  selector: 'button[uiButton], a[uiButton]',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    class: 'ui-button',
    '[class.ui-button--primary]': "variant() === 'primary'",
    '[class.ui-button--outline]': "variant() === 'outline'",
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
}
