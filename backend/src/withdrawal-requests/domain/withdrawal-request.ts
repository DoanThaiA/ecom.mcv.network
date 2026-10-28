export enum WithdrawalRequestStatus {
  pending = 1,
  approved = 2,
  paid = 3,
  rejected = 4,
}

export class WithdrawalRequest {
  id: string;
  affiliateId: string;
  agentName: string;
  recipientName: string;
  bankAccountNumber: string;
  bankName: string;
  amount: number;
  note?: string | null;
  status: WithdrawalRequestStatus;
  requestDate: Date;
  processedBy?: string | null;
  processedDate?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
