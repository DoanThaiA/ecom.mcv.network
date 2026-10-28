// Map tên màu tiếng Việt -> hex code
export const colorNameToHex: Record<string, string> = {
  'Đen': '#000000',
  'Trắng': '#FFFFFF',
  'Đỏ': '#FF0000',
  'Xanh': '#2563EB',
  'Xanh lá': '#00FF00',
  'Xám': '#808080',
  'Hồng': '#FFC0CB',
  'Vàng': '#FFFF00',
  'Nâu': '#8B4513',
  'Be': '#F5F5DC',
  'Cam': '#FFA500',
  'Tím': '#800080',
};

export const getColorHex = (colorName: string): string => {
  return colorNameToHex[colorName] || '#CCCCCC';
};
