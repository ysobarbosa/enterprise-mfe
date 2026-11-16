import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AvailabilityStatus, ProductsStore } from '@enterprise/shared/data-access';
import { Badge, BadgeTone, Button, Card, InfiniteScroll } from '@enterprise/shared/ui';

// Translating domain values into design-system vocabulary is the app's job:
// the ui lib knows tones, the data-access lib knows availability.
const AVAILABILITY: Record<AvailabilityStatus, { readonly label: string; readonly tone: BadgeTone }> = {
  'In Stock': { label: 'Disponível', tone: 'success' },
  'Low Stock': { label: 'Últimas unidades', tone: 'warning' },
  'Out of Stock': { label: 'Esgotado', tone: 'neutral' },
};

@Component({
  selector: 'app-products-page',
  imports: [CurrencyPipe, Badge, Button, Card, InfiniteScroll],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
})
export class ProductsPage {
  protected readonly store = inject(ProductsStore);
  protected readonly availability = AVAILABILITY;

  constructor() {
    this.store.loadMore();
  }
}
