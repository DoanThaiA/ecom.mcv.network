/**
 * Return reasons (for RETURN type)
 */
export enum ReturnReason {
  WRONG_PRODUCT = 'wrong_product', // Gửi sai sản phẩm
  DEFECTIVE = 'defective', // Lỗi từ nhà sản xuất
  DAMAGED = 'damaged', // Hỏng trong vận chuyển
  POOR_QUALITY = 'poor_quality', // Chất lượng kém
  OTHER = 'other', // Lý do khác
}

/**
 * Exchange reasons (for EXCHANGE type)
 */
export enum ExchangeReason {
  WRONG_SIZE = 'wrong_size', // Sai size
  WRONG_COLOR = 'wrong_color', // Sai màu
  DEFECTIVE = 'defective', // Lỗi từ nhà sản xuất
  OTHER = 'other', // Lý do khác
}
