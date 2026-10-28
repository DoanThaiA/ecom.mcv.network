import {
  ReturnRequest,
  ReturnCustomer,
  ReturnOrderSnapshot,
  ReturnOrderItem,
  BankInfo,
} from '../domain/return-request';
import { ReturnRequestSchemaClass } from './return-request.schema';

/**
 * Mapper for converting between domain entity and Mongoose document
 */
export class ReturnRequestMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(doc: any): ReturnRequest {
    const entity = new ReturnRequest();

    entity.id = doc._id.toString();
    entity.userId = doc.userId?.toString();

    // Map customer
    if (doc.customer) {
      entity.customer = {
        name: doc.customer.name,
        phone: doc.customer.phone,
        email: doc.customer.email,
        address: doc.customer.address,
      };
    }

    // Map order snapshot
    if (doc.orderSnapshot) {
      entity.orderSnapshot = {
        orderId: doc.orderSnapshot.orderId,
        orderNumber: doc.orderSnapshot.orderNumber,
        nhanh: doc.orderSnapshot.nhanh
          ? {
              orderId: doc.orderSnapshot.nhanh.orderId,
              syncStatus: doc.orderSnapshot.nhanh.syncStatus,
            }
          : undefined,
        orderAmount: doc.orderSnapshot.orderAmount,
        items: (doc.orderSnapshot.items || []).map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          code: item.code,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
      };
    }

    entity.requestType = doc.requestType;
    entity.returnReasons = doc.returnReasons;
    entity.exchangeReasons = doc.exchangeReasons;
    entity.otherReason = doc.otherReason;
    entity.images = doc.images || [];

    // Map bank info
    if (doc.bankInfo) {
      entity.bankInfo = {
        bankName: doc.bankInfo.bankName,
        accountNumber: doc.bankInfo.accountNumber,
        accountHolder: doc.bankInfo.accountHolder,
      };
    }

    entity.status = doc.status;
    entity.adminNote = doc.adminNote;
    entity.createdAt = doc.createdAt;
    entity.updatedAt = doc.updatedAt;

    return entity;
  }

  /**
   * Convert domain entity to Mongoose document
   */
  static toDocument(
    entity: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<ReturnRequestSchemaClass> {
    const doc: any = {};

    doc.userId = entity.userId;
    doc.customer = entity.customer;
    doc.orderSnapshot = entity.orderSnapshot;
    doc.requestType = entity.requestType;
    doc.returnReasons = entity.returnReasons;
    doc.exchangeReasons = entity.exchangeReasons;
    doc.otherReason = entity.otherReason;
    doc.images = entity.images;
    doc.bankInfo = entity.bankInfo;
    doc.status = entity.status;
    doc.adminNote = entity.adminNote;

    return doc;
  }
}
