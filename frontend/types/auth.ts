// OAuth types (not in proto, used in auth flow)
export type OAuthProvider = 'google' | 'facebook' | 'zalo';

export interface OAuthRedirectResponse {
  url: string;
}

export interface PhoneResetPasswordCredentials {
  phone: string;
  password: string;
}

export interface PhoneForgotPasswordRequestOtp {
  phone: string;
  otpMethod?: string; // "sms" or "zns"
}

export interface PhoneForgotPasswordVerifyOtp {
  phone: string;
  otp: string;
}

export interface PhoneForgotPasswordVerifyOtpResponse {
  message: string;
  resetToken: string;
}

export interface PhoneForgotPasswordComplete {
  phone: string;
  resetToken: string;
  password: string;
  retypePassword: string;
}

export interface AuthPhonePasswordLogin {
  phone: string;
  password: string;
}

export interface AuthPhonePasswordRegister {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  otpMethod?: string;
}
