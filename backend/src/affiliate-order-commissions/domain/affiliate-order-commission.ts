export class AffiliateOrderCommissionCustomer {
  name: string;
  phone: string;
}

export class AffiliateOrderCommissionItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  price: number;
  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
}

export class AffiliateOrderCommission {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  affiliateId: string;
  affiliateCode: string;
  customer: AffiliateOrderCommissionCustomer;
  items: AffiliateOrderCommissionItem[];
  orderTotal: number;
  totalDiscount: number;
  paymentAmount: number;
  totalCommission: number;
  auditedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
