# Welcome to CChat E-Commerce Wiki

<div align="center">

![CChat E-Commerce](https://img.shields.io/badge/CChat-E--Commerce-blue?style=for-the-badge)

*Documentation for the modern e-commerce platform*

</div>

---

## About This Project

CChat E-Commerce là một nền tảng thương mại điện tử full-stack được xây dựng với công nghệ hiện đại, lấy cảm hứng từ [Coolmate.me](https://www.coolmate.me/). Dự án tập trung vào:

- ✨ **Modern Architecture**: Kiến trúc microservices với frontend/backend tách biệt
- 🚀 **High Performance**: Tối ưu hóa tốc độ và trải nghiệm người dùng
- 🔐 **Security First**: Bảo mật từ đầu với authentication và authorization mạnh mẽ
- 📱 **Mobile Responsive**: Giao diện tối ưu cho mọi thiết bị
- 🌐 **Scalable**: Dễ dàng mở rộng và bảo trì

## Quick Links

### Getting Started
- [Installation Guide](Getting-Started.md) - Hướng dẫn cài đặt và chạy dự án
- [Environment Setup](Getting-Started.md#environment-configuration) - Cấu hình môi trường
- [Development Workflow](Getting-Started.md#development-workflow) - Quy trình phát triển

### Architecture & Design
- [Architecture Overview](Architecture.md) - Tổng quan kiến trúc hệ thống
- [Tech Stack](Tech-Stack.md) - Chi tiết công nghệ sử dụng
- [Database Schema](Database-Schema.md) - Cấu trúc database
- [API Documentation](API-Documentation.md) - API endpoints và usage

### Development
- [Frontend Convention](Frontend-Convention.md) - Coding standards và best practices cho frontend
- [Backend Convention](Backend-Convention.md) - Coding standards cho backend
- [Testing Guide](Testing.md) - Hướng dẫn testing
- [Code Review Guide](Code-Review.md) - Quy trình code review

### Deployment
- [Deployment Guide](Deployment.md) - Hướng dẫn deploy
- [CI/CD Pipeline](CI-CD.md) - Continuous Integration/Deployment
- [Monitoring](Monitoring.md) - Giám sát và logging

## Tech Stack Overview

### Frontend
```
Next.js 16 + React 19 + TypeScript
└── UI: Radix UI + Tailwind CSS
└── State Management: React Context/Server Components
└── API Communication: Fetch API/Server Actions
```

### Backend
```
NestJS 11 + TypeScript + MongoDB
└── Authentication: JWT + Passport + OAuth
└── File Storage: AWS S3
└── Email: Nodemailer
└── Validation: class-validator
```

## Project Structure

```
cchat-e-commerce/
├── frontend/           # Next.js application
│   ├── app/           # App Router (Next.js 13+)
│   ├── components/    # React components
│   ├── lib/          # Utilities and helpers
│   └── public/       # Static assets
│
├── backend/          # NestJS application
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── products/ # Product management
│   │   ├── orders/   # Order processing
│   │   └── database/ # Database configuration
│   └── test/        # Tests
│
└── docs/            # Documentation (Wiki)
```

## Key Features

### 🛍️ Product Management
- Product catalog with categories
- Variants (size, color, etc.)
- Inventory management
- Image gallery with S3 storage
- Search and filtering

### 🔐 Authentication & Authorization
- Email/Password authentication
- Google OAuth integration
- Apple Sign In
- JWT token-based auth
- Role-based access control (RBAC)

### 🛒 Shopping Experience
- Shopping cart with real-time updates
- Wishlist functionality
- Product reviews and ratings
- Order history
- Order tracking

### 💳 Payment & Checkout
- Secure checkout process
- Multiple payment methods (planned)
- Order confirmation emails
- Invoice generation

### 👤 User Management
- User profiles
- Address management
- Order history
- Preferences and settings

## Design Resources

### Figma Integration
Dự án sử dụng Figma cho thiết kế UI/UX:
- **[CChat Project Design File](https://www.figma.com/design/ssQOXLUy0yEt0HwCQNugkp/CChat-Project?node-id=0-1&p=f&t=UxbfItcHmKqIFcYW-0)** - File thiết kế chính của dự án
- [Figma MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) - Tích hợp Figma với development workflow
- Design System components
- Responsive layouts
- Color schemes and typography

### AI-Assisted Development
Sử dụng [Claude](https://claude.ai/) để:
- Code generation và refactoring
- Documentation writing
- Bug fixing và optimization
- Architecture decisions

## Contributing

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng đọc:
- [Contributing Guidelines](Contributing.md)
- [Code of Conduct](Code-of-Conduct.md)
- [Pull Request Template](Pull-Request-Template.md)

## Development Resources

### Commands Reference
```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Linting

# Backend
npm run start:dev    # Development with hot reload
npm run start:swc    # Development with SWC (faster)
npm run test         # Run tests
npm run seed         # Seed database
```

### Useful Links
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

Need help? Check out:
- [FAQ](FAQ.md) - Frequently Asked Questions
- [Troubleshooting](Troubleshooting.md) - Common issues and solutions
- [GitHub Issues](https://github.com/<your-username>/cchat-e-commerce/issues) - Report bugs or request features

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<div align="center">

**[Getting Started](Getting-Started.md)** | **[Architecture](Architecture.md)** | **[Tech Stack](Tech-Stack.md)**

Made with ❤️ by CChat Team

</div>
