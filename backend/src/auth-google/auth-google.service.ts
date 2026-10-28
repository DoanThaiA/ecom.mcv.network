import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { OAuth2Client } from 'google-auth-library';
import { SocialInterface } from '../social/interfaces/social.interface';
import { AllConfigType } from '../config/config.type';
import { throwException } from '../utils/errors/throw-exception';

@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client;

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
  ) {
    this.google = new OAuth2Client(
      configService.get('google.clientId', { infer: true }),
      configService.get('google.clientSecret', { infer: true }),
    );
  }

  /**
   * Generates the Google OAuth authorization URL.
   * @returns Object containing the authorization URL
   */
  getAuthorizationUrl(returnUrl?: string): { url: string } {
    const clientId = this.configService.get('google.clientId', { infer: true });

    if (!clientId) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('social.credentialsNotConfigured'),
      });
    }

    // Get the redirect URI (the login callback endpoint)
    const websiteDomain = this.configService.getOrThrow('app.websiteDomain', {
      infer: true,
    });
    const redirectUri = `${websiteDomain}/auth/google`;

    // Generate a state parameter for CSRF protection
    let state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Embed returnUrl in state if provided (relative paths only)
    if (returnUrl && returnUrl.startsWith('/') && returnUrl.length <= 500) {
      state = `${state}|returnUrl=${encodeURIComponent(returnUrl)}`;
    }

    // Build the authorization URL using Authorization Code Flow
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    return {
      url: authUrl.toString(),
    };
  }

  /**
   * Exchange authorization code for tokens and get user profile
   * @param code - Authorization code from Google
   * @returns User profile data
   */
  async getProfileByOAuthCode(code: string): Promise<SocialInterface> {
    const websiteDomain = this.configService.getOrThrow('app.websiteDomain', {
      infer: true,
    });
    const redirectUri = `${websiteDomain}/auth/google`;

    try {
      // Exchange authorization code for tokens
      const { tokens } = await this.google.getToken({
        code,
        redirect_uri: redirectUri,
      });

      if (!tokens.id_token) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('social.wrongToken'),
        });
      }

      // Verify and decode the ID token
      const ticket = await this.google.verifyIdToken({
        idToken: tokens.id_token,
        audience: [
          this.configService.getOrThrow('google.clientId', { infer: true }),
        ],
      });

      const data = ticket.getPayload();

      if (!data) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('social.wrongToken'),
        });
      }

      return {
        id: data.sub,
        email: data.email,
        firstName: data.given_name,
        lastName: data.family_name,
        picture: data.picture,
      };
    } catch {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.wrongToken'),
      });
    }
  }
}
