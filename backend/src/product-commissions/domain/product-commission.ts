export class ProductCommission {
  id: string;

  /** null = global commission; ObjectId string = affiliate-specific */
  affiliateId: string | null;
  /** Denormalized from affiliate */
  affiliateCode?: string | null;
  productId: string;
  /** Denormalized from product */
  productSlug?: string | null;

  /** Denormalized from product */
  name: string;
  code: string;
  images: { avatar?: string | null; others?: string[] };
  costPrice: number;
  stock: number;
  category?: { id: string; name: string } | null;

  /** Resolved effective rate for this row */
  commissionRate: number;
  /** costPrice * commissionRate / 100, rounded to hundreds */
  estimatedCommission: number;
  /** Whether this row has an explicitly set per-product rate */
  isCustomRate: boolean;

  /** Computed affiliate link for CMS display */
  affiliateLink?: string | null;

  createdAt: Date;
  updatedAt: Date;
}
