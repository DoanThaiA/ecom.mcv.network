import { Affiliate } from '../domain/affiliate';
import { AffiliateSchemaClass } from './affiliate.schema';

export class AffiliateMapper {
  static toDomain(raw: AffiliateSchemaClass): Affiliate {
    const domainEntity = new Affiliate();
    domainEntity.id = raw._id.toString();
    domainEntity.name = raw.name;
    domainEntity.affiliateCode = raw.affiliateCode;
    domainEntity.type = raw.type;
    domainEntity.email = raw.email;
    domainEntity.phone = raw.phone;
    domainEntity.bankAccountHolder = raw.bankAccountHolder ?? null;
    domainEntity.bankName = raw.bankName ?? null;
    domainEntity.bankAccountNumber = raw.bankAccountNumber ?? null;
    domainEntity.citizenId = raw.citizenId ?? null;
    domainEntity.notes = raw.notes ?? null;
    domainEntity.status = raw.status;
    domainEntity.defaultCommissionRate = raw.defaultCommissionRate ?? null;
    domainEntity.autoUpdateProducts = raw.autoUpdateProducts;
    domainEntity.totalEarned = raw.totalEarned ?? 0;
    domainEntity.totalWithdrawn = raw.totalWithdrawn ?? 0;
    domainEntity.pendingAmount = raw.pendingAmount ?? 0;
    domainEntity.availableBalance = raw.availableBalance ?? 0;
    domainEntity.balanceUpdatedAt = raw.balanceUpdatedAt ?? null;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt ?? null;
    return domainEntity;
  }

  static toDocument(domainEntity: Affiliate): AffiliateSchemaClass {
    const doc = new AffiliateSchemaClass();
    if (domainEntity.id && typeof domainEntity.id === 'string') {
      doc._id = domainEntity.id;
    }
    doc.name = domainEntity.name;
    doc.affiliateCode = domainEntity.affiliateCode;
    doc.type = domainEntity.type;
    doc.email = domainEntity.email;
    doc.phone = domainEntity.phone;
    doc.bankAccountHolder = domainEntity.bankAccountHolder;
    doc.bankName = domainEntity.bankName;
    doc.bankAccountNumber = domainEntity.bankAccountNumber;
    doc.citizenId = domainEntity.citizenId;
    doc.notes = domainEntity.notes;
    doc.status = domainEntity.status;
    doc.defaultCommissionRate = domainEntity.defaultCommissionRate;
    doc.autoUpdateProducts = domainEntity.autoUpdateProducts;
    doc.totalEarned = domainEntity.totalEarned ?? 0;
    doc.totalWithdrawn = domainEntity.totalWithdrawn ?? 0;
    doc.pendingAmount = domainEntity.pendingAmount ?? 0;
    doc.availableBalance = domainEntity.availableBalance ?? 0;
    doc.balanceUpdatedAt = domainEntity.balanceUpdatedAt ?? null;
    doc.createdAt = domainEntity.createdAt;
    doc.updatedAt = domainEntity.updatedAt;
    if (domainEntity.deletedAt !== undefined) {
      doc.deletedAt = domainEntity.deletedAt;
    }
    return doc;
  }
}
