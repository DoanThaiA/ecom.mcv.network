# Architecture Overview

## System Architecture

CChat E-Commerce được xây dựng theo kiến trúc **Client-Server** với frontend và backend tách biệt hoàn toàn, cho phép scale độc lập và phát triển song song.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Next.js 16 (React 19)                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Pages    │  │ Components │  │   Hooks    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │         Server Components / SSR            │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTP/REST API
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                      API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              NestJS Application                       │  │
│  │                                                        │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │  │
│  │  │  Auth   │  │  Users  │  │Products │  │ Orders │ │  │
│  │  │ Module  │  │ Module  │  │ Module  │  │ Module │ │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Middleware & Guards                   │   │  │
│  │  │  - JWT Auth Guard                             │   │  │
│  │  │  - Role Guard                                 │   │  │
│  │  │  - Validation Pipes                           │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │   AWS S3     │  │    Email     │
│   Database   │  │ File Storage │  │   Service    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Frontend Architecture

### Next.js App Router Structure

```
frontend/
├── app/                      # App Router (Next.js 13+)
│   ├── (auth)/              # Auth group routes
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/              # Shop group routes
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   ├── api/                 # API routes (if needed)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
│
├── components/              # React components
│   ├── ui/                  # Radix UI components
│   ├── features/            # Feature-specific components
│   │   ├── product/
│   │   ├── cart/
│   │   └── auth/
│   └── shared/              # Shared components
│
├── lib/                     # Utilities
│   ├── api/                 # API client
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Helper functions
│   └── constants/           # Constants
│
└── public/                  # Static assets
```

### Component Architecture

```
┌─────────────────────────────────────────┐
│           Page Component (RSC)           │
│  - Server-side rendering                 │
│  - Data fetching                         │
│  - SEO optimization                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Layout Component                 │
│  - Common layout elements                │
│  - Navigation, Footer                    │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Feature    │  │   Feature    │
│  Components  │  │  Components  │
│  (Client)    │  │  (Server)    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ UI Components│  │  UI Components│
│  (Radix UI)  │  │  (Custom)    │
└──────────────┘  └──────────────┘
```

## Backend Architecture

### NestJS Module Structure

```
backend/src/
├── main.ts                  # Application entry point
├── app.module.ts            # Root module
│
├── auth/                    # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── google.strategy.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
│
├── users/                   # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
│
├── products/                # Product management
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   ├── schemas/
│   │   └── product.schema.ts
│   └── dto/
│
├── orders/                  # Order management
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.module.ts
│   └── schemas/
│       └── order.schema.ts
│
├── files/                   # File upload (S3)
│   ├── files.controller.ts
│   ├── files.service.ts
│   └── files.module.ts
│
├── mail/                    # Email service
│   ├── mail.service.ts
│   └── mail.module.ts
│
├── database/                # Database configuration
│   ├── database.module.ts
│   └── seeds/
│
└── common/                  # Shared utilities
    ├── decorators/
    ├── filters/
    ├── interceptors/
    └── pipes/
```

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│         Controllers (HTTP Layer)             │
│  - Request handling                          │
│  - Response formatting                       │
│  - Input validation                          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         Services (Business Logic)            │
│  - Business rules                            │
│  - Data processing                           │
│  - External API calls                        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         Repositories (Data Layer)            │
│  - Database queries (Mongoose)               │
│  - Data persistence                          │
│  - Cache management                          │
└─────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
┌────────┐
│ Client │
└───┬────┘
    │ 1. POST /auth/login
    │    { email, password }
    ▼
┌──────────────────┐
│  Auth Controller │
└────┬─────────────┘
     │ 2. Validate credentials
     ▼
┌──────────────┐
│ Auth Service │
└────┬─────────┘
     │ 3. Check user in DB
     ▼
┌──────────────┐
│  Users DB    │
└────┬─────────┘
     │ 4. User found
     ▼
┌──────────────┐
│ JWT Service  │
└────┬─────────┘
     │ 5. Generate token
     ▼
┌────────┐
│ Client │  ← 6. Return { token, user }
└────────┘
```

### Product Listing Flow

```
┌────────┐
│ Client │
└───┬────┘
    │ 1. GET /products?category=x&page=1
    ▼
┌─────────────────────┐
│ Products Controller │
└────┬────────────────┘
     │ 2. Parse query params
     ▼
┌─────────────────┐
│ Products Service│
└────┬────────────┘
     │ 3. Build query
     ▼
┌──────────────┐
│ MongoDB      │
└────┬─────────┘
     │ 4. Return documents
     ▼
┌─────────────────┐
│ Products Service│
└────┬────────────┘
     │ 5. Format response
     ▼
┌────────┐
│ Client │  ← 6. Return { products, total, page }
└────────┘
```

### File Upload Flow (S3)

```
┌────────┐
│ Client │
└───┬────┘
    │ 1. POST /files/upload
    │    FormData (file)
    ▼
┌─────────────────┐
│ Files Controller│
└────┬────────────┘
     │ 2. Validate file
     ▼
┌──────────────┐
│ Files Service│
└────┬─────────┘
     │ 3. Upload to S3
     ▼
┌──────────────┐
│   AWS S3     │
└────┬─────────┘
     │ 4. Return URL
     ▼
┌──────────────┐
│ Files Service│
└────┬─────────┘
     │ 5. Save metadata to DB
     ▼
┌────────┐
│ Client │  ← 6. Return { url, key }
└────────┘
```

## Database Design

### MongoDB Collections

```
users
├── _id: ObjectId
├── email: string (unique)
├── password: string (hashed)
├── firstName: string
├── lastName: string
├── role: enum ['user', 'admin']
├── provider: enum ['local', 'google', 'apple']
├── avatar: string (S3 URL)
├── addresses: Address[]
├── createdAt: Date
└── updatedAt: Date

products
├── _id: ObjectId
├── name: string
├── slug: string (unique)
├── description: string
├── price: number
├── discount: number
├── category: ObjectId → categories
├── images: string[] (S3 URLs)
├── variants: Variant[]
│   ├── size: string
│   ├── color: string
│   ├── stock: number
│   └── sku: string
├── tags: string[]
├── featured: boolean
├── createdAt: Date
└── updatedAt: Date

orders
├── _id: ObjectId
├── user: ObjectId → users
├── items: OrderItem[]
│   ├── product: ObjectId → products
│   ├── variant: Object
│   ├── quantity: number
│   └── price: number
├── total: number
├── status: enum ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
├── shippingAddress: Address
├── paymentMethod: string
├── paymentStatus: enum ['pending', 'paid', 'failed']
├── createdAt: Date
└── updatedAt: Date

categories
├── _id: ObjectId
├── name: string
├── slug: string (unique)
├── parent: ObjectId → categories (optional)
├── image: string (S3 URL)
└── description: string
```

## Security Architecture

### Authentication & Authorization

```
Request → JWT Guard → Role Guard → Controller
            │             │
            ▼             ▼
    Validate Token   Check Permissions
            │             │
            ▼             ▼
      JWT Payload    User Role
            │             │
            └─────┬───────┘
                  ▼
           Access Granted
```

### Security Layers

1. **Network Layer**
   - HTTPS/TLS encryption
   - CORS configuration
   - Rate limiting

2. **Application Layer**
   - JWT authentication
   - Password hashing (bcrypt)
   - Input validation (class-validator)
   - SQL injection prevention (Mongoose)
   - XSS protection

3. **Data Layer**
   - Encrypted sensitive data
   - Secure password storage
   - Access control (MongoDB)

## Scalability Considerations

### Horizontal Scaling

```
        Load Balancer
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
 [API 1] [API 2] [API 3]
    │        │        │
    └────────┼────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
    MongoDB   Redis Cache
    Cluster   (Future)
```

### Performance Optimization

- **Server-Side Rendering (SSR)**: Next.js automatic optimization
- **Static Generation**: Pre-render pages at build time
- **Image Optimization**: Next.js Image component + S3 CDN
- **Database Indexing**: MongoDB indexes on frequently queried fields
- **API Response Caching**: Future implementation with Redis
- **Lazy Loading**: Component and route-based code splitting

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              GitHub Repository               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│           CI/CD Pipeline (Future)            │
│  - Build                                     │
│  - Test                                      │
│  - Deploy                                    │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Frontend   │  │   Backend    │
│   (Vercel/   │  │   (Railway/  │
│   Netlify)   │  │   Heroku)    │
└──────────────┘  └──────────────┘
        │                 │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  MongoDB     │  │   AWS S3     │
│  Atlas       │  │              │
└──────────────┘  └──────────────┘
```

## Design Patterns Used

### Backend Patterns
- **Dependency Injection**: NestJS core pattern
- **Repository Pattern**: Data access abstraction
- **Strategy Pattern**: Authentication strategies (JWT, OAuth)
- **Guard Pattern**: Authorization and authentication
- **Pipe Pattern**: Request validation and transformation
- **Module Pattern**: Code organization

### Frontend Patterns
- **Component Composition**: React component structure
- **Container/Presentational**: Separating logic from UI
- **Custom Hooks**: Reusable stateful logic
- **Server Components**: Next.js server-side rendering
- **Compound Components**: Radix UI pattern

---

**Next**: [Tech Stack Details](Tech-Stack.md) | **Previous**: [Home](Home.md)
