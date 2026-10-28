# CLAUDE.md - CChat E-Commerce Project Guide

## Project Overview

CChat E-Commerce is a full-stack e-commerce platform consisting of multiple applications and services.

## Project Structure

```
cchat-e-commerce/
├── backend/              # NestJS REST API backend
├── frontend/             # Next.js customer-facing frontend
├── cms/                  # Vite/React CMS admin panel
├── mobile/               # Mobile application
├── infra/                # Kubernetes & Helm charts infrastructure
├── proto/                # Protocol Buffer definitions
├── code-convention/      # Coding conventions and standards
└── docs/                 # Project documentation
```

### 1. Backend (`/backend`)
**Tech Stack:** NestJS + TypeScript + MongoDB + REST API

**Purpose:** Main API server handling:
- User authentication and authorization
- Product catalog management
- Order processing
- Payment integration
- Admin operations

**Key Files:**
- `src/` - Source code (controllers, services, DTOs, entities)
- `test/` - Integration and unit tests
- `package.json` - Dependencies and scripts

### 2. Frontend (`/frontend`)
**Tech Stack:** Next.js 14 + TypeScript + Redux-Saga + Tailwind CSS

**Purpose:** Customer-facing e-commerce website with:
- Product browsing and search
- Shopping cart and checkout
- User account management
- Multi-language support (Vietnamese/English) with next-intl
- Server-side rendering (SSR)

**Key Files:**
- `app/` - Next.js App Router pages
- `components/` - Reusable React components
- `lib/` - Utilities, helpers, Redux store, API repositories
- `messages/` - i18n translation files (vi.json, en.json)

### 3. CMS (`/cms`)
**Tech Stack:** Vite + React + TypeScript + Tailwind CSS

**Purpose:** Admin panel for:
- Product management (CRUD operations)
- Order management
- User management
- Content management
- Analytics and reports

**Key Files:**
- `src/` - Source code (components, pages, services)
- `vite.config.ts` - Vite configuration

### 4. Infrastructure (`/infra`)
**Tech Stack:** Kubernetes + Helm + GCP

**Purpose:** Deployment and infrastructure configuration:
- Helm charts for backend, frontend, CMS
- Kubernetes manifests
- GCP Load Balancer configurations (BackendConfig, Ingress)
- Environment-specific configurations (staging, production)

**Key Files:**
- `charts/` - Helm charts for each service
- `k8s/` - Kubernetes manifests
- `values-*.yaml` - Environment-specific configurations

### 5. Code Conventions (`/code-convention`)
**CRITICAL:** All developers MUST read and follow these conventions before writing code.

**Files:**
- `vite-convention.md` - Frontend (React/Vite) coding standards
- `react-test-convention.md` - Frontend testing conventions

---

## 🚨 MANDATORY: Code Convention Requirements

### Before Writing ANY Code

**For Frontend (`/frontend` or `/cms`) work:**
1. **READ** `/code-convention/vite-convention.md` - React/TypeScript standards
2. **READ** `/code-convention/react-test-convention.md` - Testing patterns

### Key Convention Requirements

**Backend:**
- ✅ REST API with proper HTTP methods and status codes
- ✅ TypeScript strict mode (no `any`, explicit types)
- ✅ DTOs with class-validator decorators
- ✅ JWT authentication and permission-based authorization
- ✅ Error handling with HTTP exceptions
- ✅ JSDoc comments in English for all methods
- ✅ Tests with Jest and Supertest

**Frontend:**
- ✅ All text through i18n: `t('key')` - NO hardcoded text
- ✅ **CRITICAL i18n Rule:** Before adding new locale keys, ALWAYS search existing locale files first (`src/locales/` for CMS, `messages/` for Frontend). Reuse existing keys as much as possible to avoid duplication
- ✅ Tailwind CSS only - NO inline styles
- ✅ Radix UI components - NO raw HTML tags
- ✅ TypeScript strict mode (no `any`)
- ✅ File size limits: 500 lines/file, 50 lines/function
- ✅ Redux-Saga for state management
- ✅ Tests with Vitest and React Testing Library

---

## 🔍 Pre-Pull Request Checklist

### Before Creating ANY Pull Request

You MUST run these commands and ensure NO ERRORS:

#### Backend (`/backend`)
```bash
cd backend

# 1. Run linter - MUST PASS
npm run lint

# 2. Run tests - ALL MUST PASS
npm run test

# 3. Build project - MUST SUCCEED
npm run build
```

#### Frontend (`/frontend`)
```bash
cd frontend

# 1. Run linter - MUST PASS
npm run lint

# 2. Build project - MUST SUCCEED
npm run build
```

#### CMS (`/cms`)
```bash
cd cms

# 1. Check code formatting - MUST PASS
npm run fm:check

# 2. Build project - MUST SUCCEED
npm run build
```

### ⚠️ CRITICAL RULES

**DO NOT create a Pull Request if:**
- ❌ `npm run lint` has ANY errors or warnings
- ❌ `npm run test` has ANY failing tests
- ❌ `npm run build` fails
- ❌ You haven't read the relevant code conventions
- ❌ Code contains hardcoded text (must use i18n)
- ❌ Code has inline styles (must use Tailwind)
- ❌ TypeScript has `any` types without documentation

**Every PR MUST:**
- ✅ Pass all linting checks
- ✅ Pass all tests
- ✅ Build successfully
- ✅ Follow code conventions
- ✅ Include tests for new features/bug fixes
- ✅ Update version files (version.json, VERSION.md) if applicable

---

## 📝 Development Workflow

### 1. Start New Feature/Bug Fix

```bash
# Checkout from appropriate base branch
git checkout internal  # or staging
git pull origin internal

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Read Conventions
- Frontend/CMS work? → Read `code-convention/vite-convention.md`

### 3. Write Code

Follow the conventions from step 2:
- Use proper patterns (Controller → Service → Repository for backend)
- Add proper types (TypeScript strict mode)
- Use i18n for all user-facing text
- Add tests for your changes

### 4. Write Tests

- Backend: Jest unit tests + integration tests
- Frontend: Vitest + React Testing Library integration tests
- Aim for high coverage (utils 100%, logic 90%, components 80%)

### 5. Pre-Commit Checks

Run in the appropriate folder:
```bash
npm run lint    # Fix all errors
npm run test    # All tests must pass
npm run build   # Build must succeed
```

### 6. Commit Changes

```bash
git add .
git commit -m "feat: your descriptive commit message"
```

### 7. Create Pull Request

```bash
git push -u origin feature/your-feature-name
gh pr create --base internal
```

**PR Description must include:**
- What changed
- Why it changed
- How to test it
- Screenshots (for UI changes)
- Confirmation that lint, test, build all passed

---

## 🎯 Quick Reference

### Common Commands

| Action | Backend | Frontend | CMS |
|--------|---------|----------|-----|
| **Install** | `npm install` | `npm install` | `npm install` |
| **Dev Server** | `npm run start:dev` | `npm run dev` | `npm run dev` |
| **Lint** | `npm run lint` | `npm run lint` | `npm run fm:check` |
| **Test** | `npm run test` | N/A | N/A |
| **Build** | `npm run build` | `npm run build` | `npm run build` |

### File Locations

| Need | Path |
|------|------|
| **Frontend conventions** | `/code-convention/vite-convention.md` |
| **Frontend test conventions** | `/code-convention/react-test-convention.md` |
| **API documentation** | `/docs/` |
| **Environment configs** | `/infra/charts/*/values-*.yaml` |

---

## 🚀 Getting Started Checklist

- [ ] Clone repository
- [ ] Read this CLAUDE.md file
- [ ] Read relevant code conventions for your work area
- [ ] Set up development environment (Node.js, npm)
- [ ] Install dependencies in folder you'll work in
- [ ] Run dev server to verify setup
- [ ] Run lint, test, build to verify everything works
- [ ] Create feature branch
- [ ] Start coding following conventions

---

## 📚 Additional Resources

- **Main README:** `/README.md` - Project setup and overview
- **Documentation:** `/docs/` - Additional technical documentation
- **GitHub Actions:** `/.github/workflows/` - CI/CD pipelines

---

**Remember:** Quality over speed. Follow conventions, write tests, ensure builds pass. This prevents bugs in production and makes code maintainable.
