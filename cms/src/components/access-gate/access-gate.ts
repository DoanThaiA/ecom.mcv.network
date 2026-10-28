const INTERNAL_HOSTNAME = 'internalcchatcms.mmenu.io';
const PRODUCTION_URL = 'https://cms.cchat.vn';
const STORAGE_KEY = 'cchat_dev_access';
const DEV_PARAM = 'dev';
const DEV_PASSCODE = 'Mmenu@1234';

function stripDevParam(): void {
  const params = new URLSearchParams(window.location.search);
  params.delete(DEV_PARAM);
  const newSearch = params.toString();
  const newUrl =
    window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
  window.history.replaceState({}, '', newUrl);
}

export function shouldShowAccessGate(): boolean {
  if (window.location.host !== INTERNAL_HOSTNAME) {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const devParam = params.get(DEV_PARAM);

  const passParam = params.get('pass');
  if (devParam === '1' && passParam === DEV_PASSCODE) {
    localStorage.setItem(STORAGE_KEY, '1');
    params.delete(DEV_PARAM);
    params.delete('pass');
    const newSearch = params.toString();
    const cleanUrl =
      window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
    return false;
  }

  if (devParam === '0') {
    localStorage.removeItem(STORAGE_KEY);
    stripDevParam();
  }

  return localStorage.getItem(STORAGE_KEY) !== '1';
}

export function renderAccessGate(root: HTMLElement): void {
  root.innerHTML = `
    <style>
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes logoFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255, 48, 60, 0.3); }
        50% { box-shadow: 0 0 0 12px rgba(255, 48, 60, 0); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-4px) rotate(-3deg); }
        40% { transform: translateX(4px) rotate(3deg); }
        60% { transform: translateX(-3px) rotate(-2deg); }
        80% { transform: translateX(3px) rotate(2deg); }
      }
      @keyframes unlockPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      .gate-btn:hover {
        background-color: #e0202c !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(255, 48, 60, 0.35);
      }
      .gate-btn:active { transform: translateY(0); }
      .gate-logo { cursor: pointer; user-select: none; }
      .gate-logo:active img { transform: scale(0.9); }
      .gate-logo img { transition: transform 0.15s ease; }
    </style>
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Public Sans', sans-serif;
      background: linear-gradient(160deg, #fff5f5 0%, #f0f4ff 50%, #f5f0ff 100%);
      color: #333;
      text-align: center;
      padding: 24px;
    ">
      <div style="
        background: white;
        border-radius: 24px;
        padding: 56px 48px;
        max-width: 480px;
        width: 100%;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
        animation: fadeInUp 0.6s ease-out;
      ">
        <div
          id="gate-logo"
          class="gate-logo"
          style="
            margin: 0 auto 28px;
            animation: logoFloat 3s ease-in-out infinite;
          "
        >
          <img
            src="/website_icon.png"
            alt="CChat"
            style="width: 72px; height: 72px;"
            onerror="this.parentElement.style.display='none'"
          />
        </div>
        <h1 style="
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #1a1a1a;
          letter-spacing: -0.3px;
        ">CChat CMS đã có địa chỉ mới!</h1>
        <p style="
          font-size: 15px;
          color: #888;
          margin: 0 0 36px 0;
          line-height: 1.7;
        ">
          CChat CMS đã được nâng cấp và chuyển sang<br/>
          địa chỉ mới để phục vụ bạn tốt hơn.
        </p>
        <a
          href="${PRODUCTION_URL}"
          class="gate-btn"
          style="
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background-color: #FF303C;
            color: white;
            font-size: 18px;
            font-weight: 600;
            padding: 20px 64px;
            border-radius: 14px;
            text-decoration: none;
            transition: all 0.25s ease;
            animation: pulse 2.5s ease-in-out infinite;
          "
        >
          Đi đến cms.cchat.vn
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </a>
        <div style="
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        ">
          <p style="
            font-size: 13px;
            color: #bbb;
            margin: 0;
          ">Địa chỉ mới: <span style="color: #FF303C; font-weight: 600;">cms.cchat.vn</span></p>
        </div>
      </div>
    </div>
  `;

  // Secret: click logo 10 times to show password prompt
  const logo = document.getElementById('gate-logo');
  if (logo) {
    const REQUIRED_CLICKS = 10;
    const CLICK_TIMEOUT = 3000;
    let clickCount = 0;
    let lastClickTime = 0;

    logo.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime > CLICK_TIMEOUT) {
        clickCount = 0;
      }
      lastClickTime = now;
      clickCount++;

      if (clickCount >= 7 && clickCount < REQUIRED_CLICKS) {
        logo.style.animation = 'shake 0.4s ease';
        setTimeout(() => {
          logo.style.animation = 'logoFloat 3s ease-in-out infinite';
        }, 400);
      }

      if (clickCount >= REQUIRED_CLICKS) {
        clickCount = 0;
        logo.style.animation = 'unlockPulse 0.5s ease';
        setTimeout(() => {
          logo.style.animation = 'logoFloat 3s ease-in-out infinite';
          showPasswordPrompt(root);
        }, 500);
      }
    });
  }
}

function showPasswordPrompt(root: HTMLElement): void {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; animation: fadeInUp 0.3s ease-out;
    font-family: 'Public Sans', sans-serif;
  `;
  overlay.innerHTML = `
    <div style="
      background: white; border-radius: 20px; padding: 36px 32px;
      max-width: 360px; width: 90%; text-align: center;
      box-shadow: 0 16px 48px rgba(0,0,0,0.15);
    ">
      <div style="font-size: 32px; margin-bottom: 12px;">🔐</div>
      <p style="font-size: 15px; color: #555; margin: 0 0 20px; line-height: 1.5;">
        Nhập mật khẩu để truy cập
      </p>
      <div style="position: relative;">
        <input
          id="gate-password"
          type="password"
          placeholder="Mật khẩu"
          style="
            width: 100%; padding: 12px 44px 12px 16px; border: 2px solid #e0e0e0;
            border-radius: 10px; font-size: 15px; outline: none;
            box-sizing: border-box; transition: border-color 0.2s;
            font-family: 'Public Sans', sans-serif;
          "
          onfocus="this.style.borderColor='#FF303C'"
          onblur="this.style.borderColor='#e0e0e0'"
        />
        <button
          id="gate-toggle-pw"
          type="button"
          style="
            position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
            background: none; border: none; cursor: pointer; padding: 4px;
            display: flex; align-items: center; color: #999;
          "
        >
          <svg id="gate-eye-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
          <svg id="gate-eye-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
      <p id="gate-error" style="
        font-size: 13px; color: #FF303C; margin: 8px 0 0; display: none;
      ">Sai mật khẩu</p>
      <button
        id="gate-submit"
        style="
          width: 100%; margin-top: 16px; padding: 12px; border: none;
          background: #FF303C; color: white; font-size: 15px; font-weight: 600;
          border-radius: 10px; cursor: pointer; transition: background 0.2s;
          font-family: 'Public Sans', sans-serif;
        "
        onmouseover="this.style.background='#e0202c'"
        onmouseout="this.style.background='#FF303C'"
      >Xác nhận</button>
      <button
        id="gate-cancel"
        style="
          width: 100%; margin-top: 8px; padding: 10px; border: none;
          background: transparent; color: #999; font-size: 14px;
          cursor: pointer; font-family: 'Public Sans', sans-serif;
        "
      >Hủy</button>
    </div>
  `;
  root.appendChild(overlay);

  const input = document.getElementById('gate-password') as HTMLInputElement;
  const error = document.getElementById('gate-error') as HTMLElement;
  const submit = document.getElementById('gate-submit') as HTMLButtonElement;
  const cancel = document.getElementById('gate-cancel') as HTMLButtonElement;

  input.focus();

  function tryUnlock(): void {
    if (input.value === DEV_PASSCODE) {
      localStorage.setItem(STORAGE_KEY, '1');
      window.location.reload();
    } else {
      error.style.display = 'block';
      input.style.borderColor = '#FF303C';
      input.value = '';
      input.focus();
    }
  }

  submit.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });
  cancel.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const togglePw = document.getElementById('gate-toggle-pw') as HTMLButtonElement;
  const eyeOff = document.getElementById('gate-eye-off') as HTMLElement;
  const eyeOn = document.getElementById('gate-eye-on') as HTMLElement;
  togglePw.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    eyeOff.style.display = isPassword ? 'none' : 'block';
    eyeOn.style.display = isPassword ? 'block' : 'none';
    input.focus();
  });
}
