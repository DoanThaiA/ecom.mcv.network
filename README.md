# CChat E-Commerce Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

*A modern, full-stack e-commerce platform inspired by Coolmate.me*

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Documentation](#documentation)

</div>

---

## Overview

CChat E-Commerce là một nền tảng thương mại điện tử full-stack hiện đại, được xây dựng với công nghệ tiên tiến và kiến trúc microservices. Dự án lấy cảm hứng từ Coolmate.me, tập trung vào trải nghiệm người dùng tối ưu và hiệu suất cao.

## Features

- **🛍️ Product Management**: Quản lý sản phẩm đa dạng với hình ảnh, biến thể, và tồn kho
- **🔐 Authentication**: Đăng nhập đa nền tảng (Google, Apple, Email/Password)
- **🛒 Shopping Cart**: Giỏ hàng thông minh với real-time updates
- **💳 Payment Integration**: Tích hợp thanh toán an toàn
- **📱 Responsive Design**: Giao diện tối ưu cho mọi thiết bị
- **🔍 Search & Filter**: Tìm kiếm và lọc sản phẩm nhanh chóng
- **👤 User Profile**: Quản lý thông tin cá nhân và lịch sử đơn hàng
- **🌐 i18n Support**: Hỗ trợ đa ngôn ngữ

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework với Server Components
- **UI Library**: [React 19](https://react.dev/)
- **Component Library**: [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- **Styling**: Tailwind CSS (inspired by Coolmate)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **TypeScript**: Type-safe development
- **Linting**: ESLint với cấu hình Next.js

### Backend
- **Framework**: [NestJS 11](https://nestjs.com/) - Progressive Node.js framework
- **Database**: [MongoDB](https://www.mongodb.com/) với Mongoose ODM
- **Authentication**:
  - JWT tokens
  - Passport strategies (JWT, Anonymous)
  - OAuth 2.0 (Google, Apple)
- **File Storage**: AWS S3 integration
- **Email Service**: Nodemailer với Handlebars templates
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI (planned)

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier
- **Release Management**: release-it với conventional changelog

## Project Structure

```
cchat-e-commerce/
├── frontend/               # Next.js frontend application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── public/           # Static assets
│   └── package.json
│
├── backend/               # NestJS backend API
│   ├── src/
│   │   ├── auth/         # Authentication modules
│   │   ├── database/     # Database configuration
│   │   ├── users/        # User management
│   │   └── ...
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB instance
- AWS account (for S3 storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cchat-e-commerce
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Configuration**

   Create `.env` files in both frontend and backend directories. See `.env.example` for required variables.

### Running the Application

**Development Mode:**

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm run start:dev
```

**Production Mode:**

Frontend:
```bash
cd frontend
npm run build
npm start
```

Backend:
```bash
cd backend
npm run build
npm run start:prod
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run start:swc` - Start with SWC builder (faster)
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run seed:run:document` - Seed database

## Documentation

Để biết thêm thông tin chi tiết, vui lòng tham khảo [Wiki](https://github.com/<your-username>/cchat-e-commerce/wiki):

- [Architecture Overview](https://github.com/<your-username>/cchat-e-commerce/wiki/Architecture)
- [Tech Stack Details](https://github.com/<your-username>/cchat-e-commerce/wiki/Tech-Stack)
- [API Documentation](https://github.com/<your-username>/cchat-e-commerce/wiki/API-Documentation)
- [Deployment Guide](https://github.com/<your-username>/cchat-e-commerce/wiki/Deployment)

## Design & Tools

- **Design Inspiration**: [Coolmate.me](https://www.coolmate.me/)
- **Design File**: [CChat Figma Design](https://www.figma.com/design/ssQOXLUy0yEt0HwCQNugkp/CChat-Project?node-id=0-1&p=f&t=UxbfItcHmKqIFcYW-0)
- **Design Tool**: [Figma](https://www.figma.com/) với [Figma MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- **AI Assistant**: [Claude](https://claude.ai/) - Development assistance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Coolmate.me](https://www.coolmate.me/)
- Built with modern web technologies
- Powered by the open-source community

---

<div align="center">
Made with ❤️ by CChat Team
</div>
# ecom.mcv.network
