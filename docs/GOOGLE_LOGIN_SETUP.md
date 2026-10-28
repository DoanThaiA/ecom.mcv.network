# Google Login Setup Guide

**Implementation**: Sử dụng `@react-oauth/google` với hook `useGoogleLogin`

## Bước 1: Tạo Google OAuth Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Chọn Application type: **Web application**

## Bước 2: Configure OAuth consent screen

Trước khi tạo OAuth client ID, bạn cần configure consent screen:

1. Vào **APIs & Services** > **OAuth consent screen**
2. Chọn **External** (cho testing) hoặc **Internal** (nếu có Google Workspace)
3. Điền thông tin:
   - App name: Tên app của bạn
   - User support email: Email của bạn
   - Developer contact: Email của bạn
4. Click **SAVE AND CONTINUE**
5. Scopes: Không cần thêm gì, click **SAVE AND CONTINUE**
6. Test users: Thêm email để test (cho External mode)
7. Click **SAVE AND CONTINUE**

## Bước 3: Tạo OAuth 2.0 Client ID

1. Quay lại **Credentials** > **+ CREATE CREDENTIALS** > **OAuth client ID**
2. Application type: **Web application**
3. Name: Đặt tên (ví dụ: "CChat Web Client")
4. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3001
   ```
   (Thêm tất cả origins mà bạn sẽ chạy app)

5. **Authorized redirect URIs**:
   - Có thể để trống cho Google Identity Services
   - Hoặc thêm: `http://localhost:3000/auth/callback`

6. Click **CREATE**

## Bước 4: Copy Client ID

1. Sau khi tạo xong, bạn sẽ thấy popup với:
   - **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
   - **Client secret**: (không cần cho frontend)

2. Copy **Client ID**

## Bước 5: Cấu hình trong project

1. Mở file `.env.local`
2. Thay thế `your-google-client-id-here.apps.googleusercontent.com` bằng Client ID thật:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

## Bước 6: Test Google Login

1. Mở browser: `http://localhost:3000`
2. Click vào avatar icon để mở SignInDialog
3. Click vào button **Google**
4. Chọn tài khoản Google
5. Kiểm tra console để xem Access Token và User Info:
   ```
   Google Access Token: ya29.a0AfB_byC...
   Google User Info: { email: "...", name: "...", sub: "...", picture: "..." }
   User Email: user@example.com
   User Name: John Doe
   User Picture: https://lh3.googleusercontent.com/...
   User Sub (ID): 123456789012345678901
   ```

**Lưu ý**: `useGoogleLogin` trả về **access_token** (không phải id_token JWT). Access token này có thể được dùng để:
- Lấy user info từ Google API (như đã implement)
- Gửi lên backend để verify và tạo session
- Access các Google APIs khác (nếu có permission)

## Troubleshooting

### Lỗi: "Access blocked: Authorization Error"
- Consent screen đang ở mode "Testing" và user không nằm trong test users list
- **Fix**: Thêm email của bạn vào Test users trong OAuth consent screen

### Lỗi: "Invalid origin"
- Origin không được whitelist
- **Fix**: Thêm `http://localhost:3000` vào Authorized JavaScript origins

### Lỗi: "redirect_uri_mismatch"
- (Không nên xảy ra với Google Identity Services)
- **Fix**: Kiểm tra lại Authorized redirect URIs

### Lỗi: FedCM AbortError
- Đã fix bằng cách thêm `use_fedcm_for_prompt: false` trong code
- Nếu vẫn gặp, kiểm tra xem Client ID đã được set đúng chưa

## Production Deployment

Khi deploy lên production:

1. Vào Google Cloud Console > Credentials
2. Edit OAuth 2.0 Client ID
3. Thêm production domain vào **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

4. Update `.env.production` hoặc environment variables trên hosting platform:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
   ```

5. Nếu consent screen ở mode "Testing", publish lên "Production":
   - Vào OAuth consent screen > **PUBLISH APP**
   - (Có thể cần verification nếu sử dụng sensitive scopes)

## Security Notes

- ✅ Client ID là **public** - OK để commit vào git
- ❌ Client Secret là **private** - KHÔNG commit vào git (nhưng không cần cho Google Sign-In frontend)
- ✅ ID Token phải được verify ở backend trước khi trust user info
- ✅ Luôn verify ID Token signature và expiration ở backend

## Backend Integration (TODO)

Khi nhận được Access Token từ frontend, backend có 2 cách verify:

### Cách 1: Verify Access Token với Google API (Đơn giản)

```javascript
// Backend example (Node.js)
async function verifyGoogleToken(accessToken) {
  // Verify token với Google
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Invalid token');
  }

  const tokenInfo = await response.json();

  // Check if token is for your app
  if (tokenInfo.aud !== YOUR_CLIENT_ID) {
    throw new Error('Token not for this app');
  }

  // Get user info
  const userResponse = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const userInfo = await userResponse.json();

  // Create user session or JWT token
  return {
    userId: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
  };
}
```

### Cách 2: Sử dụng Google Auth Library (Khuyến nghị)

```javascript
// Backend example (Node.js)
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(accessToken) {
  try {
    // Get user info using access token
    const userInfoClient = new OAuth2Client();
    const tokenInfo = await userInfoClient.getTokenInfo(accessToken);

    // Verify audience
    if (tokenInfo.aud !== CLIENT_ID) {
      throw new Error('Token not for this app');
    }

    // Get detailed user info
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userInfo = await response.json();

    // Create user session or JWT token
    return {
      userId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}
```

## References

- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [useGoogleLogin Hook](https://github.com/MomenSherif/react-oauth#usegooglelogin-both-implicit--authorization-code-flow)
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Verify Access Token](https://developers.google.com/identity/protocols/oauth2/web-server#tokeninfo-validation)
