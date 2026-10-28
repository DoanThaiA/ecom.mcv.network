# Package Lock Best Practices

## Mục tiêu

Ràng buộc package versions không bị thay đổi tùy tiện bởi các team members, đảm bảo:
- Tất cả developers dùng cùng exact version
- Tự động phát hiện và cập nhật security vulnerabilities
- Chặn malicious packages từ unauthorized registries

---

## Các files đã thêm

| File | Mục đích |
|------|----------|
| `.github/dependabot.yml` | Tự động tạo PR khi có package updates |
| `.github/workflows/lockfile-lint.yml` | Validate lockfile trong CI |
| `frontend/.npmrc` | Pin exact versions cho frontend |
| `cms/.npmrc` | Pin exact versions cho cms |

---

## Chi tiết từng component

### 1. `.npmrc` - Pin Exact Versions

```ini
save-exact=true      # Không thêm ^ hoặc ~ prefix
package-lock=true    # Luôn update package-lock.json
engine-strict=true   # Fail nếu Node version không khớp
```

**Trước khi có `.npmrc`:**
```bash
npm install axios
# package.json: "axios": "^1.6.0"
# → Có thể install 1.6.0, 1.6.1, 1.7.0... tùy thời điểm
```

**Sau khi có `.npmrc`:**
```bash
npm install axios
# package.json: "axios": "1.6.0"
# → Luôn install đúng version 1.6.0
```

---

### 2. Dependabot - Tự động cập nhật dependencies

#### Cách hoạt động

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPENDABOT FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mỗi thứ 2, 9:00 AM (Asia/Ho_Chi_Minh)                     │
│              │                                              │
│              ▼                                              │
│  ┌─────────────────────┐                                    │
│  │ Scan dependencies   │                                    │
│  │ - frontend/         │                                    │
│  │ - cms/              │                                    │
│  │ - .github/workflows │                                    │
│  └─────────────────────┘                                    │
│              │                                              │
│              ▼                                              │
│  ┌─────────────────────┐                                    │
│  │ Có updates?         │                                    │
│  └─────────────────────┘                                    │
│         │         │                                         │
│        Yes        No                                        │
│         │         │                                         │
│         ▼         ▼                                         │
│   Tạo PRs      Không làm gì                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### PRs được tạo như thế nào

Dependabot **gom nhóm** các dependencies để tránh spam PRs:

```
┌─────────────────────────────────────────────────────────────┐
│ Pull Requests                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🤖 deps(frontend): Bump production-dependencies group       │
│    - next 14.2.0 → 14.2.1                                   │
│    - react 18.2.0 → 18.3.0                                  │
│    - axios 1.6.0 → 1.6.1                                    │
│    Labels: [dependencies] [frontend]                        │
│                                                             │
│ 🤖 deps(frontend): Bump development-dependencies group      │
│    - typescript 5.3.0 → 5.4.0                               │
│    - eslint 8.56.0 → 8.57.0                                 │
│    Labels: [dependencies] [frontend]                        │
│                                                             │
│ 🤖 deps(cms): Bump production-dependencies group            │
│    - vite 5.0.0 → 5.1.0                                     │
│    - react 18.2.0 → 18.3.0                                  │
│    Labels: [dependencies] [cms]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Configuration giải thích

```yaml
version: 2
updates:
  - package-ecosystem: "npm"        # Loại package manager
    directory: "/frontend"          # Thư mục chứa package.json
    schedule:
      interval: "weekly"            # Tần suất check
      day: "monday"                 # Ngày trong tuần
      time: "09:00"                 # Giờ chạy
      timezone: "Asia/Ho_Chi_Minh"  # Timezone
    groups:
      production-dependencies:      # Gom production deps
        dependency-type: "production"
      development-dependencies:     # Gom dev deps
        dependency-type: "development"
    open-pull-requests-limit: 10    # Max PRs cùng lúc
    commit-message:
      prefix: "deps(frontend)"      # Prefix cho commit message
    labels:
      - "dependencies"              # Labels tự động gắn
      - "frontend"
```

---

### 3. Lockfile Lint - Validate trong CI

#### Cách hoạt động

```
┌─────────────────────────────────────────────────────────────┐
│                  LOCKFILE LINT FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Developer tạo PR có thay đổi package-lock.json             │
│              │                                              │
│              ▼                                              │
│  ┌─────────────────────┐                                    │
│  │ GitHub Actions      │                                    │
│  │ trigger workflow    │                                    │
│  └─────────────────────┘                                    │
│              │                                              │
│              ▼                                              │
│  ┌─────────────────────┐                                    │
│  │ lockfile-lint check │                                    │
│  │ - Registry sources  │                                    │
│  │ - HTTPS only        │                                    │
│  └─────────────────────┘                                    │
│              │                                              │
│       ┌──────┴──────┐                                       │
│       ▼             ▼                                       │
│   ✅ Pass       ❌ Fail                                     │
│   (merge OK)   (block merge)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Khi nào workflow chạy?

Chỉ chạy khi PR có thay đổi file `package-lock.json`:

```yaml
on:
  pull_request:
    paths:
      - '**/package-lock.json'  # Chỉ trigger khi lockfile thay đổi
```

#### Check những gì?

```bash
lockfile-lint --path "frontend/package-lock.json" --type npm \
  --allowed-hosts npm registry.npmjs.org \  # Chỉ cho phép npm registry
  --allowed-schemes https:                   # Chỉ cho phép HTTPS
```

#### Ví dụ khi fail

```
┌─────────────────────────────────────────────────────────────┐
│ Pull Request #205                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Checks                                                     │
│  ───────────────────────────────────────────                │
│  ❌ Lockfile Lint                          [Details]        │
│  ✅ Build Frontend                                          │
│  ✅ Build CMS                                               │
│                                                             │
│  ⚠️ Some checks were not successful                         │
│  1 failing check                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Click "Details":
───────────────────────────────────────────────────────────────
Validating frontend/package-lock.json
✖ detected invalid origin for package: lodash
    expected: https://registry.npmjs.org
    actual: http://malicious-registry.com

Error: Process completed with exit code 1.
───────────────────────────────────────────────────────────────
```

---

## Tại sao cần làm điều này?

### Vấn đề 1: Version Drift

```
Developer A (tháng 1):
  npm install → lodash@4.17.20

Developer B (tháng 3):
  npm install → lodash@4.17.21 (có breaking change)

→ "Works on my machine" bugs
```

### Vấn đề 2: Supply Chain Attacks

```
Attacker compromise maintainer account
              │
              ▼
    Publish malicious version
              │
              ▼
    Developer npm install
              │
              ▼
    Malware executed on machine
```

**Ví dụ thực tế (2025):** Shai-Hulud attack biến `npm install` thành remote code execution.

### Vấn đề 3: Outdated Dependencies

```
Package có security vulnerability
              │
              ▼
    Không ai biết để update
              │
              ▼
    Production bị exploit
```

---

## Giải pháp

| Vấn đề | Giải pháp |
|--------|-----------|
| Version drift | `save-exact=true` + `npm ci` trong Docker |
| Supply chain attacks | `lockfile-lint` validate registry |
| Outdated deps | Dependabot tự động tạo update PRs |

---

## Chi phí

| Component | Chi phí |
|-----------|---------|
| Dependabot | **Miễn phí** (GitHub cung cấp) |
| Lockfile-lint CI | **Miễn phí** (trong GitHub Actions free tier) |
| **Tổng** | **$0/tháng** |

---

## Workflow cho developers

### Khi install package mới

```bash
npm install axios
# → Tự động pin exact version (không có ^)
# → Commit cả package.json và package-lock.json
```

### Khi có Dependabot PR

1. Review PR trên GitHub
2. Check CI status (build, test)
3. Merge nếu OK, hoặc close nếu không cần update

### Khi lockfile-lint fail

1. Check error message trong CI logs
2. Đảm bảo packages chỉ từ `registry.npmjs.org`
3. Regenerate lockfile nếu cần: `rm package-lock.json && npm install`

---

## References

- [npm Security Best Practices](https://snyk.io/articles/npm-security-best-practices/)
- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [lockfile-lint](https://github.com/lirantal/lockfile-lint)
- [npm ci vs npm install](https://docs.npmjs.com/cli/v10/commands/npm-ci)
