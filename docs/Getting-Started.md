# Getting Started

Hướng dẫn chi tiết để cài đặt và chạy CChat E-Commerce trên máy local của bạn.

---

## Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

### Required
- **Node.js** >= 16.0.0 ([Download](https://nodejs.org/))
- **npm** >= 8.0.0 (đi kèm với Node.js)
- **Git** ([Download](https://git-scm.com/))

### External Services
- **MongoDB**: Local installation hoặc [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **AWS Account**: Để sử dụng S3 storage (có free tier)

### Recommended
- **VS Code** với extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - MongoDB for VS Code (optional)

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd cchat-e-commerce
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Expected output:**
```
added XXX packages in Xs
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

## Environment Configuration

### Frontend Environment Variables

Tạo file `.env.local` trong thư mục `frontend/`:

```bash
cd frontend
touch .env.local
```

Thêm các biến sau:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Analytics (for production)
# NEXT_PUBLIC_GA_ID=your-ga-id
```

### Backend Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```bash
cd backend
touch .env
```

Thêm các biến sau:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=mongodb://localhost:27017/cchat-ecommerce
# Hoặc sử dụng MongoDB Atlas:
# DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/cchat-ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cchat-uploads

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_FROM=noreply@cchat.com

# OAuth (Optional for now)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Database Setup

### Option 1: Local MongoDB

#### Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Download từ [MongoDB Download Center](https://www.mongodb.com/try/download/community)

#### Verify Installation

```bash
mongosh
# Should connect to mongodb://localhost:27017
```

### Option 2: MongoDB Atlas (Cloud)

1. Tạo account tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo free cluster (M0)
3. Tạo database user
4. Whitelist IP (hoặc cho phép tất cả: 0.0.0.0/0 cho dev)
5. Lấy connection string
6. Cập nhật `DATABASE_URL` trong `.env`

---

## AWS S3 Setup

### 1. Create S3 Bucket

```bash
# Sử dụng AWS CLI hoặc Console
aws s3 mb s3://cchat-uploads
```

### 2. Configure CORS

Thêm CORS policy cho bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Get Access Keys

1. Vào IAM → Users → Create User
2. Attach policy: `AmazonS3FullAccess`
3. Create access key
4. Cập nhật `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`

---

## Running the Application

### Development Mode

#### 1. Start Backend

```bash
cd backend
npm run start:dev
```

**Expected output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Application is running on: http://localhost:3001
```

**Test backend:**
```bash
curl http://localhost:3001
# Should return API info
```

#### 2. Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
- Ready in 2.5s
```

#### 3. Open Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## Seeding Database (Optional)

Để thêm dữ liệu mẫu vào database:

```bash
cd backend
npm run seed:run:document
```

**Sample data includes:**
- Users (admin, test users)
- Products
- Categories

---

## Development Workflow

### Project Structure

```
cchat-e-commerce/
├── frontend/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Utils, hooks, API client
│   ├── public/          # Static assets
│   └── .env.local       # Frontend env vars
│
└── backend/
    ├── src/
    │   ├── auth/        # Authentication
    │   ├── users/       # User management
    │   ├── products/    # Products (to be created)
    │   └── ...
    ├── test/            # Tests
    └── .env             # Backend env vars
```

### Making Changes

#### Frontend Development

1. **Create new page:**
   ```bash
   # Create app/products/page.tsx
   cd frontend/app
   mkdir products
   touch products/page.tsx
   ```

2. **Create new component:**
   ```bash
   cd frontend/components
   mkdir product
   touch product/ProductCard.tsx
   ```

3. **Add API client:**
   ```typescript
   // lib/api/products.ts
   export const getProducts = async () => {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
     return res.json()
   }
   ```

#### Backend Development

1. **Create new module:**
   ```bash
   cd backend
   nest g module products
   nest g controller products
   nest g service products
   ```

2. **Create schema:**
   ```typescript
   // src/products/schemas/product.schema.ts
   @Schema({ timestamps: true })
   export class Product {
     @Prop({ required: true })
     name: string;

     @Prop()
     price: number;
   }
   ```

3. **Create DTO:**
   ```typescript
   // src/products/dto/create-product.dto.ts
   export class CreateProductDto {
     @IsString()
     name: string;

     @IsNumber()
     price: number;
   }
   ```

### Code Quality

#### Linting

```bash
# Frontend
cd frontend
npm run lint
npm run lint:fix

# Backend
cd backend
npm run lint
```

#### Formatting (if Prettier configured)

```bash
npm run format
```

---

## Testing

### Backend Tests

#### Unit Tests
```bash
cd backend
npm test
```

#### Test Coverage
```bash
npm run test:cov
```

### Frontend Tests (to be configured)
```bash
cd frontend
npm test
```

---

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Error:**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Check if MongoDB is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status mongodb
   ```

2. Start MongoDB if not running:
   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongodb
   ```

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Find process using port:
   ```bash
   lsof -i :3000
   ```

2. Kill process:
   ```bash
   kill -9 <PID>
   ```

### Issue: Environment Variables Not Loaded

**Solution:**
1. Ensure `.env` file exists
2. Check file name (`.env.local` for frontend, `.env` for backend)
3. Restart development server
4. Verify variables:
   ```typescript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```

### Issue: AWS S3 Upload Failed

**Error:**
```
AccessDenied: Access Denied
```

**Solution:**
1. Verify AWS credentials in `.env`
2. Check IAM permissions
3. Verify bucket name
4. Check bucket CORS configuration

---

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting errors |

### Backend

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot reload |
| `npm run start:swc` | Start with SWC (faster) |
| `npm run start:debug` | Start in debug mode |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production build |
| `npm test` | Run unit tests |
| `npm run test:cov` | Generate coverage report |
| `npm run lint` | Run ESLint |
| `npm run seed:run:document` | Seed database |

---

## Next Steps

Now that you have the project running:

1. **Explore the codebase:**
   - Read [Architecture Overview](Architecture.md)
   - Understand [Tech Stack](Tech-Stack.md)

2. **Check design files:**
   - Open [Figma Design](https://www.figma.com/design/ssQOXLUy0yEt0HwCQNugkp/CChat-Project?node-id=0-1&p=f&t=UxbfItcHmKqIFcYW-0)
   - Study component designs

3. **Start developing:**
   - Pick a task from the backlog
   - Create a feature branch
   - Make your changes
   - Submit a pull request

4. **Join the team:**
   - Read [Contributing Guidelines](Contributing.md)
   - Check [Code Standards](Code-Standards.md)

---

## Getting Help

- **Documentation**: Check other Wiki pages
- **Issues**: [GitHub Issues](https://github.com/<your-username>/cchat-e-commerce/issues)
- **Discussions**: [GitHub Discussions](https://github.com/<your-username>/cchat-e-commerce/discussions)

---

**Next**: [API Documentation](API-Documentation.md) | **Previous**: [Tech Stack](Tech-Stack.md)
