export interface Store {
  id: string;
  name: string;
  shortName: string;
  city: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
  googleMapUrl: string;
  googleMapEmbedUrl: string;
}

export interface StoreGroup {
  city: string;
  stores: Store[];
}

export const STORES: Store[] = [
  // Hà Nội
  {
    id: 'ba-trieu',
    name: 'CCHAT - Bà Triệu',
    shortName: 'Bà Triệu',
    city: 'Hà Nội',
    address: 'Số 58B Bà Triệu, Hoàn Kiếm, Hà Nội',
    phone: '0867 812 970',
    openTime: '8:00',
    closeTime: '22:00',
    googleMapUrl: 'https://maps.google.com/?q=58B+Ba+Trieu+Hoan+Kiem+Ha+Noi',
    googleMapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.506849699771!2d105.84799261493253!3d21.01703598600673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953df89b4d%3A0x7b0c8b0b0b0b0b0b!2s58B%20B%C3%A0%20Tri%E1%BB%87u%2C%20Ho%C3%A0n%20Ki%E1%BA%BFm%2C%20H%C3%A0%20N%E1%BB%99i!5e0!3m2!1svi!2s!4v1234567890',
  },
  {
    id: 'pham-ngoc-thach',
    name: 'CCHAT - Phạm Ngọc Thạch',
    shortName: 'Phạm Ngọc Thạch',
    city: 'Hà Nội',
    address: 'Số 36 Phạm Ngọc Thạch, Đống Đa, Hà Nội',
    phone: '0867 812 971',
    openTime: '8:00',
    closeTime: '22:00',
    googleMapUrl: 'https://maps.google.com/?q=36+Pham+Ngoc+Thach+Dong+Da+Ha+Noi',
    googleMapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.506849699771!2d105.83299261493253!3d21.00703598600673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953df89b4d%3A0x7b0c8b0b0b0b0b0b!2s36%20Ph%E1%BA%A1m%20Ng%E1%BB%8Dc%20Th%E1%BA%A1ch%2C%20%C4%90%E1%BB%91ng%20%C4%90a%2C%20H%C3%A0%20N%E1%BB%99i!5e0!3m2!1svi!2s!4v1234567890',
  },
  {
    id: 'hang-voi',
    name: 'CCHAT - Hàng Vôi',
    shortName: 'Hàng Vôi',
    city: 'Hà Nội',
    address: 'Số 25 Hàng Vôi, Hoàn Kiếm, Hà Nội',
    phone: '0973 954 066',
    openTime: '8:00',
    closeTime: '22:00',
    googleMapUrl: 'https://maps.google.com/?q=25+Hang+Voi+Hoan+Kiem+Ha+Noi',
    googleMapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.506849699771!2d105.85299261493253!3d21.03703598600673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953df89b4d%3A0x7b0c8b0b0b0b0b0b!2s25%20H%C3%A0ng%20V%C3%B4i%2C%20Ho%C3%A0n%20Ki%E1%BA%BFm%2C%20H%C3%A0%20N%E1%BB%99i!5e0!3m2!1svi!2s!4v1234567890',
  },
  // Hải Phòng
  {
    id: 'hai-phong',
    name: 'CCHAT - Hải Phòng',
    shortName: 'Hải Phòng',
    city: 'Hải Phòng',
    address: 'Số 123 Lạch Tray, Ngô Quyền, Hải Phòng',
    phone: '0867 812 974',
    openTime: '8:00',
    closeTime: '22:00',
    googleMapUrl: 'https://maps.google.com/?q=123+Lach+Tray+Ngo+Quyen+Hai+Phong',
    googleMapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3728.506849699771!2d106.68299261493253!3d20.84703598600673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a7a953df89b4d%3A0x7b0c8b0b0b0b0b0b!2s123%20L%E1%BA%A1ch%20Tray%2C%20Ng%C3%B4%20Quy%E1%BB%81n%2C%20H%E1%BA%A3i%20Ph%C3%B2ng!5e0!3m2!1svi!2s!4v1234567890',
  },
  // TP. Hồ Chí Minh
  {
    id: 'hcm',
    name: 'CCHAT - TP. Hồ Chí Minh',
    shortName: 'TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    address: 'Số 789 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '0867 812 976',
    openTime: '8:00',
    closeTime: '22:00',
    googleMapUrl: 'https://maps.google.com/?q=789+Nguyen+Hue+Quan+1+Ho+Chi+Minh',
    googleMapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.506849699771!2d106.70299261493253!3d10.77703598600673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f953df89b4d%3A0x7b0c8b0b0b0b0b0b!2s789%20Nguy%E1%BB%85n%20Hu%E1%BB%87%2C%20Qu%E1%BA%ADn%201%2C%20TP.%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1234567890',
  },
];

// Group stores by city
export function getStoresByCity(): StoreGroup[] {
  const hanoiStores = STORES.filter((store) => store.city === 'Hà Nội');
  const otherStores = STORES.filter((store) => store.city !== 'Hà Nội');

  const groups: StoreGroup[] = [];

  if (hanoiStores.length > 0) {
    groups.push({
      city: 'Hà Nội',
      stores: hanoiStores,
    });
  }

  // Group other cities
  const otherCities = [...new Set(otherStores.map((s) => s.city))];
  if (otherCities.length > 0) {
    groups.push({
      city: 'Các thành phố khác',
      stores: otherStores,
    });
  }

  return groups;
}

export const STORE_STATS = {
  totalStores: 5,
  customersPerDay: 5000,
};
