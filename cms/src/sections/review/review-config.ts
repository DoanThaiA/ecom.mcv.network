export const columnWidths = {
  orderId: '12%',
  nhanhId: '8%',
  product: '15%',
  height: '8%',
  weight: '8%',
  fitLevel: '10%',
  content: '35%',
  status: '6%',
};

export const getColumnStyle = (key: string, isLast = false) => ({
  width: columnWidths[key as keyof typeof columnWidths] ?? '10%',
  borderRight: isLast ? 'none' : '1px solid #E5E6EB',
  p: 1.5,
  display: 'flex',
  alignItems: 'center',
});
