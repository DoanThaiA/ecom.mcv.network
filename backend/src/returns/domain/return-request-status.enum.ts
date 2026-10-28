/**
 * Return request status enum
 */
export enum ReturnRequestStatus {
  PENDING = 'pending', // Chờ xử lý
  APPROVED = 'approved', // Đã duyệt
  REJECTED = 'rejected', // Từ chối
  COMPLETED = 'completed', // Hoàn thành
}
