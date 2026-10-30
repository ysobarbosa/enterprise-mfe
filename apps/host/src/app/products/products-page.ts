import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProductsStore } from '@enterprise/shared/data-access';

@Component({
  selector: 'app-products-page',
  imports: [CurrencyPipe],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
})
export class ProductsPage {
  protected readonly store = inject(ProductsStore);

  constructor() {
    this.store.loadMore();
  }
}
