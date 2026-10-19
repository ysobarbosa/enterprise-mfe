export type AvailabilityStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface ProductDimensions {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

export interface ProductReview {
  readonly rating: number;
  readonly comment: string;
  readonly date: string; // ISO 8601
  readonly reviewerName: string;
  readonly reviewerEmail: string;
}

export interface ProductMeta {
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string; // ISO 8601
  readonly barcode: string;
  readonly qrCode: string;
}

export interface Product {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly price: number;
  readonly discountPercentage: number;
  readonly rating: number;
  readonly stock: number;
  readonly tags: readonly string[];
  /** Absent for roughly half of the catalog. */
  readonly brand?: string;
  readonly sku: string;
  readonly weight: number;
  readonly dimensions: ProductDimensions;
  readonly warrantyInformation: string;
  readonly shippingInformation: string;
  readonly availabilityStatus: AvailabilityStatus;
  readonly reviews: readonly ProductReview[];
  readonly returnPolicy: string;
  readonly minimumOrderQuantity: number;
  readonly meta: ProductMeta;
  readonly images: readonly string[];
  readonly thumbnail: string;
}

export interface ProductsResponse {
  readonly products: readonly Product[];
  readonly total: number;
  readonly skip: number;
  readonly limit: number;
}
