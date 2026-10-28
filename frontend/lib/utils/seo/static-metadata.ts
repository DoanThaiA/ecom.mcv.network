/**
 * Static Page Metadata Configuration
 * SEO metadata for all static pages in Vietnamese and English
 */

import type { StaticPageKey, StaticPageSeoConfig } from './types';

/**
 * Static page SEO configurations
 */
export const STATIC_PAGE_METADATA: Record<StaticPageKey, StaticPageSeoConfig> = {
  home: {
    title: {
      vi: 'CChat Shop - Thời trang cao cấp, phong cách hiện đại',
      en: 'CChat Shop - Premium Fashion, Modern Style',
    },
    description: {
      vi: 'CChat Shop - Thời trang cao cấp, phong cách hiện đại. Mua sắm online với giá tốt nhất, giao hàng nhanh chóng toàn quốc.',
      en: 'CChat Shop - Premium fashion, modern style. Shop online with the best prices, fast delivery nationwide.',
    },
  },

  about: {
    title: {
      vi: 'Về chúng tôi | CChat Shop',
      en: 'About Us | CChat Shop',
    },
    description: {
      vi: 'Tìm hiểu về CChat Shop - Thương hiệu thời trang cao cấp với sứ mệnh mang đến phong cách hiện đại cho người Việt.',
      en: 'Learn about CChat Shop - A premium fashion brand with a mission to bring modern style to Vietnamese people.',
    },
  },

  categories: {
    title: {
      vi: 'Danh mục sản phẩm | CChat Shop',
      en: 'Product Categories | CChat Shop',
    },
    description: {
      vi: 'Khám phá danh mục sản phẩm thời trang đa dạng tại CChat Shop. Từ áo, quần, phụ kiện đến các bộ sưu tập mới nhất.',
      en: 'Explore diverse fashion product categories at CChat Shop. From tops, bottoms, accessories to the latest collections.',
    },
  },

  faq: {
    title: {
      vi: 'Câu hỏi thường gặp | CChat Shop',
      en: 'Frequently Asked Questions | CChat Shop',
    },
    description: {
      vi: 'Giải đáp các câu hỏi thường gặp về mua hàng, thanh toán, giao hàng và chính sách đổi trả tại CChat Shop.',
      en: 'Find answers to frequently asked questions about shopping, payment, delivery and return policy at CChat Shop.',
    },
  },

  locations: {
    title: {
      vi: 'Hệ thống cửa hàng | CChat Shop',
      en: 'Store Locations | CChat Shop',
    },
    description: {
      vi: 'Tìm cửa hàng CChat Shop gần bạn. Hệ thống showroom trên toàn quốc với đội ngũ tư vấn chuyên nghiệp.',
      en: 'Find a CChat Shop store near you. Nationwide showroom system with professional consulting team.',
    },
  },

  guide: {
    title: {
      vi: 'Hướng dẫn mua hàng | CChat Shop',
      en: 'Shopping Guide | CChat Shop',
    },
    description: {
      vi: 'Hướng dẫn chi tiết cách mua hàng online tại CChat Shop. Đặt hàng nhanh, thanh toán an toàn, giao hàng tận nơi.',
      en: 'Detailed guide on how to shop online at CChat Shop. Fast ordering, secure payment, doorstep delivery.',
    },
  },

  news: {
    title: {
      vi: 'Tin tức thời trang | CChat Shop',
      en: 'Fashion News | CChat Shop',
    },
    description: {
      vi: 'Cập nhật tin tức thời trang mới nhất, xu hướng mùa này và các bí quyết phối đồ từ CChat Shop.',
      en: 'Stay updated with the latest fashion news, seasonal trends and styling tips from CChat Shop.',
    },
  },

  'policy/terms': {
    title: {
      vi: 'Điều khoản sử dụng | CChat Shop',
      en: 'Terms of Service | CChat Shop',
    },
    description: {
      vi: 'Điều khoản và điều kiện sử dụng dịch vụ tại CChat Shop. Vui lòng đọc kỹ trước khi mua hàng.',
      en: 'Terms and conditions for using CChat Shop services. Please read carefully before shopping.',
    },
  },

  'policy/privacy': {
    title: {
      vi: 'Chính sách bảo mật | CChat Shop',
      en: 'Privacy Policy | CChat Shop',
    },
    description: {
      vi: 'Chính sách bảo mật thông tin khách hàng tại CChat Shop. Cam kết bảo vệ dữ liệu cá nhân của bạn.',
      en: 'Customer information privacy policy at CChat Shop. Committed to protecting your personal data.',
    },
  },

  'policy/return': {
    title: {
      vi: 'Chính sách đổi trả | CChat Shop',
      en: 'Return Policy | CChat Shop',
    },
    description: {
      vi: 'Chính sách đổi trả hàng tại CChat Shop. Đổi trả miễn phí trong 30 ngày với sản phẩm còn nguyên tem mác.',
      en: 'Return policy at CChat Shop. Free returns within 30 days for products with original tags.',
    },
  },

  'policy/delivery': {
    title: {
      vi: 'Chính sách giao hàng | CChat Shop',
      en: 'Delivery Policy | CChat Shop',
    },
    description: {
      vi: 'Chính sách giao hàng của CChat Shop. Giao hàng nhanh toàn quốc, miễn phí với đơn hàng từ 500.000đ.',
      en: 'CChat Shop delivery policy. Fast nationwide delivery, free shipping for orders over 500,000 VND.',
    },
  },

  'policy/vip': {
    title: {
      vi: 'Chương trình VIP | CChat Shop',
      en: 'VIP Program | CChat Shop',
    },
    description: {
      vi: 'Chương trình khách hàng VIP của CChat Shop. Tích điểm đổi quà, ưu đãi độc quyền và nhiều quyền lợi hấp dẫn.',
      en: 'CChat Shop VIP customer program. Earn points for rewards, exclusive offers and many attractive benefits.',
    },
  },

  flashSale: {
    title: {
      vi: 'Flash Sale - Ưu đãi siêu tốc | CChat Shop',
      en: 'Flash Sale - Super Fast Deals | CChat Shop',
    },
    description: {
      vi: 'Flash Sale tại CChat Shop - Giảm giá sốc, ưu đãi siêu tốc. Mua ngay để không bỏ lỡ cơ hội tiết kiệm lớn.',
      en: 'Flash Sale at CChat Shop - Shock discounts, super fast deals. Buy now to not miss big savings opportunities.',
    },
  },
};
