import mongoose from 'mongoose';
import { WithdrawalRequest } from '../domain/withdrawal-request';
import { WithdrawalRequestSchemaClass } from './withdrawal-request.schema';

export class WithdrawalRequestMapper {
  static toDomain(raw: WithdrawalRequestSchemaClass): WithdrawalRequest {
    const entity = new WithdrawalRequest();
    entity.id = raw._id.toString();
    entity.affiliateId = raw.affiliateId.toString();
    entity.agentName = raw.agentName;
    entity.recipientName = raw.recipientName;
    entity.bankAccountNumber = raw.bankAccountNumber;
    entity.bankName = raw.bankName;
    entity.amount = raw.amount;
    entity.note = raw.note ?? null;
    entity.status = raw.status;
    entity.requestDate = raw.requestDate;
    entity.processedBy = raw.processedBy ?? null;
    entity.processedDate = raw.processedDate ?? null;
    entity.rejectionReason = raw.rejectionReason ?? null;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;
    return entity;
  }

  static toDocument(domain: WithdrawalRequest): WithdrawalRequestSchemaClass {
    const doc = new WithdrawalRequestSchemaClass();
    if (domain.id) {
      doc._id = domain.id;
    }
    doc.affiliateId = new mongoose.Types.ObjectId(domain.affiliateId);
    doc.agentName = domain.agentName;
    doc.recipientName = domain.recipientName;
    doc.bankAccountNumber = domain.bankAccountNumber;
    doc.bankName = domain.bankName;
    doc.amount = domain.amount;
    doc.note = domain.note ?? null;
    doc.status = domain.status;
    doc.requestDate = domain.requestDate;
    doc.processedBy = domain.processedBy ?? null;
    doc.processedDate = domain.processedDate ?? null;
    doc.rejectionReason = domain.rejectionReason ?? null;
    return doc;
  }
}
