# Technology Stack

## Overview

CChat E-Commerce được xây dựng với các công nghệ hiện đại, lấy cảm hứng từ stack của [Coolmate.me](https://www.coolmate.me/). Dưới đây là chi tiết về từng công nghệ được sử dụng.

---

## Frontend Stack

### Core Framework

#### Next.js 16
```json
"next": "^16.0.1"
```

**Why Next.js?**
- **Server-Side Rendering (SSR)**: Tối ưu SEO và performance
- **React Server Components**: Giảm JavaScript bundle size
- **App Router**: Routing hiện đại với nested layouts
- **Image Optimization**: Tự động optimize hình ảnh
- **API Routes**: Built-in API endpoints
- **Fast Refresh**: Hot reload cực nhanh

**Key Features Used:**
- App Router với Server Components
- Server Actions cho form handling
- Image optimization với next/image
- Font optimization
- Automatic code splitting

**Coolmate.me Inspiration:**
Coolmate sử dụng Next.js để đạt được tốc độ tải trang nhanh và SEO tốt, đặc biệt quan trọng cho e-commerce.

#### React 19
```json
"react": "^19.2.0",
"react-dom": "^19.2.0"
```

**New Features:**
- Server Components
- Improved hydration
- Better error handling
- Enhanced hooks

### UI & Styling

#### Radix UI Themes
```json
"@radix-ui/themes": "^3.2.1",
"@radix-ui/react-icons": "^1.3.2"
```

**Components Used:**
- Dialog, Dropdown, Popover
- Tabs, Switch, Radio Group
- Avatar, Separator, Progress
- Alert Dialog, Hover Card
- Toolbar, Toggle

**Why Radix UI?**
- **Accessibility**: WCAG compliant components
- **Unstyled**: Có thể customize hoàn toàn
- **Composable**: Flexible component composition
- **TypeScript**: Full type safety

**Coolmate Comparison:**
Coolmate sử dụng custom design system tương tự, chúng ta dùng Radix UI để có foundation vững chắc về accessibility.

#### Tailwind CSS (Planned)
Inspired by Coolmate's utility-first approach:
- Utility-first CSS framework
- Rapid prototyping
- Consistent design system
- Small production bundle

### State Management & Data Fetching

**Current Approach:**
- React Context API (lightweight state)
- Server Components (server-side data)
- Client-side fetch for dynamic data

**Future Considerations:**
- Zustand/Jotai for complex client state
- TanStack Query for server state
- SWR for data fetching

### Notifications

#### Sonner
```json
"sonner": "^2.0.7"
```

**Features:**
- Beautiful toast notifications
- Promise-based API
- Customizable styling
- Stacking and positioning
- TypeScript support

**Usage:**
```typescript
import { toast } from 'sonner'

toast.success('Product added to cart')
toast.error('Failed to process order')
```

### Development Tools

#### TypeScript
```json
"@types/node": "24.10.0",
"@types/react": "19.2.2"
```

**Benefits:**
- Type safety
- Better IDE support
- Catch errors early
- Self-documenting code

#### ESLint
```json
"eslint": "^9.39.1",
"eslint-config-next": "^16.0.1"
```

**Plugins:**
- `@typescript-eslint/eslint-plugin`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`

---

## Backend Stack

### Core Framework

#### NestJS 11
```json
"@nestjs/core": "11.1.6",
"@nestjs/common": "11.1.6"
```

**Why NestJS?**
- **TypeScript Native**: Built with TS from ground up
- **Modular Architecture**: Scalable code organization
- **Dependency Injection**: Clean, testable code
- **Express/Fastify**: Can switch HTTP adapter
- **Decorators**: Clean, readable code
- **Built-in Features**: Guards, Pipes, Interceptors

**Architecture:**
```
Controllers → Services → Repositories → Database
     ↓           ↓            ↓
  Guards     Business      Data
  Pipes       Logic       Access
```

**Coolmate Inspiration:**
E-commerce platform cần kiến trúc vững chắc để scale, NestJS cung cấp structure tốt như các enterprise framework.

### Database

#### MongoDB with Mongoose
```json
"mongoose": "8.19.1",
"@nestjs/mongoose": "11.0.3",
"mongoose-autopopulate": "^1.1.0"
```

**Why MongoDB?**
- **Flexible Schema**: Perfect for e-commerce products
- **Scalability**: Horizontal scaling với sharding
- **Performance**: Fast reads for product catalogs
- **Document Model**: Natural fit for complex objects

**Schema Design:**
```typescript
// Product Schema Example
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ size: String, color: String, stock: Number }] })
  variants: Variant[];

  @Prop({ type: Types.ObjectId, ref: 'Category', autopopulate: true })
  category: Category;
}
```

**Key Features:**
- Auto-populate for relations
- Virtual properties
- Timestamps
- Indexes for performance
- Validation

### Authentication & Authorization

#### Passport Strategies
```json
"@nestjs/passport": "11.0.5",
"passport": "0.7.0",
"passport-jwt": "4.0.1",
"passport-anonymous": "1.0.1"
```

**Strategies Implemented:**
- **JWT Strategy**: Token-based auth
- **Anonymous Strategy**: Public routes
- **Google OAuth**: (google-auth-library)
- **Apple Sign In**: (apple-signin-auth)

#### JWT Tokens
```json
"@nestjs/jwt": "11.0.0"
```

**Token Flow:**
```
Login → Validate → Generate JWT → Return Token
                        ↓
              Store user payload
                        ↓
    Protected Route → Verify JWT → Extract User
```

**Security:**
- bcrypt for password hashing
- Expiring tokens
- Refresh token strategy (future)

### File Storage

#### AWS S3
```json
"@aws-sdk/client-s3": "3.864.0",
"@aws-sdk/s3-request-presigner": "3.864.0",
"multer-s3": "3.0.1"
```

**Upload Flow:**
```
Client → Upload File → Multer → S3 → Return URL
                         ↓
                Save metadata to MongoDB
```

**Features:**
- Presigned URLs for secure uploads
- Direct browser-to-S3 uploads (future)
- Image processing (planned)
- CDN integration

**Coolmate Inspiration:**
Coolmate sử dụng CDN (mcdn.coolmate.me) để serve static assets nhanh chóng, chúng ta dùng S3 làm foundation.

### Email Service

#### Nodemailer
```json
"nodemailer": "7.0.6",
"handlebars": "4.7.8"
```

**Templates:**
- Welcome email
- Order confirmation
- Password reset
- Order status updates

**Template Engine:**
```handlebars
<h1>Hello {{name}}</h1>
<p>Your order #{{orderId}} has been {{status}}</p>
```

### Validation & Transformation

#### Class Validator & Transformer
```json
"class-validator": "0.14.2",
"class-transformer": "0.5.1"
```

**DTO Example:**
```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  variants: VariantDto[];
}
```

**Benefits:**
- Automatic validation
- Type coercion
- Custom validators
- Error messages

### Internationalization

#### NestJS i18n
```json
"nestjs-i18n": "10.5.1"
```

**Features:**
- Multi-language support
- Validation message translation
- Request-based locale
- Fallback languages

### Development Tools

#### Testing
```json
"jest": "30.1.3",
"@nestjs/testing": "11.1.6",
"supertest": "7.1.4"
```

**Test Types:**
- Unit tests
- Integration tests
- E2E tests
- Test coverage

#### Code Quality
```json
"prettier": "3.6.2",
"eslint": "9.35.0"
```

**Standards:**
- Consistent code formatting
- Import organization
- Naming conventions
- TypeScript strict mode

---

## DevOps & Infrastructure

### Version Control
- **Git**: Source control
- **GitHub**: Repository hosting
- **Conventional Commits**: Commit message format

### CI/CD (Planned)
```yaml
# Future GitHub Actions workflow
- Build frontend & backend
- Run tests
- Deploy to staging
- Deploy to production
```

### Deployment Targets

#### Frontend
**Options:**
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify

**Features:**
- Automatic deployments
- Preview deployments
- CDN distribution
- Edge functions

#### Backend
**Options:**
- Railway
- Heroku
- AWS EC2/ECS
- DigitalOcean App Platform

**Requirements:**
- Node.js runtime
- MongoDB connection
- Environment variables
- S3 access

#### Database
**MongoDB Atlas:**
- Managed MongoDB service
- Automatic backups
- Monitoring
- Scaling

---

## Development Workflow

### Package Managers
```json
"engines": {
  "node": ">=16.0.0",
  "npm": ">=8.0.0"
}
```

### Build Tools
- **Next.js Compiler**: Rust-based, super fast
- **SWC**: Alternative to Babel for NestJS
- **TypeScript Compiler**: Type checking

### Code Quality Tools

#### Pre-commit Hooks (Planned)
- Lint staged files
- Format with Prettier
- Type checking
- Run relevant tests

#### Release Management
```json
"release-it": "19.0.5",
"@release-it/conventional-changelog": "10.0.1"
```

**Workflow:**
```bash
npm run release
# → Version bump
# → Generate changelog
# → Create git tag
# → GitHub release
```

---

## Third-Party Integrations

### Analytics (Inspired by Coolmate)
**Planned:**
- Google Analytics
- Meta Pixel
- TikTok Pixel
- Insider (behavioral analytics)

### Payment Gateway (Future)
**Options:**
- Stripe
- PayPal
- VNPay (Vietnam)
- MoMo (Vietnam)

### Shipping Integration (Future)
**Vietnam Providers:**
- Giao Hàng Nhanh
- Giao Hàng Tiết Kiệm
- ViettelPost

---

## Performance Optimization

### Frontend
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: next/image + S3 CDN
- **Font Optimization**: next/font
- **Lazy Loading**: React.lazy for components
- **Caching**: Browser & CDN caching

### Backend
- **Database Indexing**: MongoDB indexes
- **Query Optimization**: Projection, aggregation
- **Caching Layer**: Redis (planned)
- **Connection Pooling**: Mongoose built-in

### Infrastructure
- **CDN**: CloudFront/CloudFlare for static assets
- **Load Balancing**: For horizontal scaling
- **Compression**: Gzip/Brotli
- **HTTP/2**: Modern protocol

---

## Security Stack

### Frontend Security
- **XSS Prevention**: React automatic escaping
- **CSRF Protection**: SameSite cookies
- **Content Security Policy**: Headers
- **HTTPS Only**: Secure transmission

### Backend Security
- **Password Hashing**: bcryptjs
- **JWT Tokens**: Signed & expiring
- **Rate Limiting**: Prevent brute force
- **Input Validation**: class-validator
- **SQL Injection**: Mongoose parameterized queries
- **Helmet**: Security headers

### Infrastructure Security
- **Environment Variables**: Secure secrets
- **S3 Bucket Policy**: Private by default
- **MongoDB Access Control**: IP whitelist
- **SSL/TLS**: Encrypted connections

---

## Design & Collaboration Tools

### Figma
**Project File:** [CChat Figma Design](https://www.figma.com/design/ssQOXLUy0yEt0HwCQNugkp/CChat-Project?node-id=0-1&p=f&t=UxbfItcHmKqIFcYW-0)

**Integration:**
- [Figma MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- Design tokens export
- Component specs
- Responsive breakpoints

**Workflow:**
```
Design in Figma → Export Assets → Implement Components → Review
```

### AI-Assisted Development

#### Claude
- Code generation
- Refactoring assistance
- Documentation writing
- Architecture decisions
- Bug fixing

**Usage:**
- Planning features
- Writing boilerplate
- Code reviews
- Optimization suggestions

---

## Comparison with Coolmate.me

| Feature | Coolmate | CChat E-Commerce |
|---------|----------|------------------|
| Frontend Framework | Next.js | Next.js 16 ✅ |
| UI Framework | Custom + Tailwind | Radix UI + Tailwind (planned) |
| Backend | Node.js (inferred) | NestJS 11 ✅ |
| Database | Not visible | MongoDB |
| CDN | mcdn.coolmate.me | AWS S3 + CloudFront |
| Analytics | GA, Meta, TikTok | Planned |
| SSR | Yes | Yes ✅ |
| TypeScript | Likely | Yes ✅ |

**Key Takeaways from Coolmate:**
1. **Performance First**: Fast loading times
2. **Modern Stack**: Next.js for SSR & SEO
3. **Utility CSS**: Tailwind for rapid development
4. **Analytics Heavy**: Multiple tracking services
5. **CDN Usage**: Global content delivery

---

## Future Technology Additions

### Short Term
- [ ] Tailwind CSS integration
- [ ] Redis caching layer
- [ ] Payment gateway (Stripe/VNPay)
- [ ] Real-time notifications (Socket.io)
- [ ] Search engine (Elasticsearch/Algolia)

### Medium Term
- [ ] GraphQL API (optional)
- [ ] Microservices architecture
- [ ] Message queue (RabbitMQ/Redis)
- [ ] Admin dashboard (React Admin)
- [ ] Analytics dashboard

### Long Term
- [ ] Mobile app (React Native)
- [ ] PWA features
- [ ] AI-powered recommendations
- [ ] Chatbot integration
- [ ] Multi-tenant support

---

**Next**: [Getting Started Guide](Getting-Started.md) | **Previous**: [Architecture](Architecture.md)
