import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import axios from 'axios';
import { SocialInterface } from '../social/interfaces/social.interface';
import { FacebookInterface } from './interfaces/facebook.interface';
import { AllConfigType } from '../config/config.type';
import { throwException } from '../utils/errors/throw-exception';

@Injectable()
export class AuthFacebookService {
  // Base Facebook Graph API URL and API version
  private readonly baseUrl = 'https://graph.facebook.com';
  private readonly apiVersion = 'v23.0';

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
  ) {}

  /**
   * Generates the Facebook OAuth authorization URL.
   * @returns Object containing the authorization URL and state
   */
  getAuthorizationUrl(returnUrl?: string): { url: string } {
    const appId = this.configService.get('facebook.appId', { infer: true });

    if (!appId) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('social.credentialsNotConfigured'),
      });
    }

    // Get the redirect URI (the callback endpoint)
    const websiteDomain = this.configService.getOrThrow('app.websiteDomain', {
      infer: true,
    });
    const redirectUri = `${websiteDomain}/auth/facebook`;

    // Generate a state parameter for CSRF protection
    let state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Embed returnUrl in state if provided (relative paths only)
    if (returnUrl && returnUrl.startsWith('/') && returnUrl.length <= 500) {
      state = `${state}|returnUrl=${encodeURIComponent(returnUrl)}`;
    }

    // Build the authorization URL using Facebook OAuth
    const authUrl = new URL(
      `https://www.facebook.com/${this.apiVersion}/dialog/oauth`,
    );
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email,public_profile');
    authUrl.searchParams.set('state', state);

    return {
      url: authUrl.toString(),
    };
  }

  /**
   * Exchange authorization code for access token and get user profile
   * @param code - Authorization code from Facebook
   * @returns User profile data
   */
  async getProfileByOAuthCode(code: string): Promise<SocialInterface> {
    const websiteDomain = this.configService.getOrThrow('app.websiteDomain', {
      infer: true,
    });
    const redirectUri = `${websiteDomain}/auth/facebook`;

    try {
      // Step 1: Exchange authorization code for access token
      const accessToken = await this.exchangeCodeForToken(code, redirectUri);

      // Step 2: Get user profile using the access token
      const profileUrl = new URL(`${this.baseUrl}/${this.apiVersion}/me`);
      profileUrl.searchParams.set(
        'fields',
        'id,last_name,email,first_name,picture.width(200)',
      );
      profileUrl.searchParams.set('access_token', accessToken);

      const response = await axios.get<FacebookInterface>(
        profileUrl.toString(),
        {
          headers: {
            Accept: 'application/json',
          },
          timeout: 10000,
        },
      );

      const data: FacebookInterface = response.data;

      if (!data.id) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('social.wrongToken'),
        });
      }

      return {
        id: data.id,
        email: data.email || undefined,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        picture: data.picture?.data?.url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('social.wrongToken'),
        });
      }

      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.wrongToken'),
      });
    }
  }

  /**
   * Exchanges authorization code for access token
   * @param code - Authorization code from Facebook
   * @param redirectUri - The redirect URI used in the authorization request
   * @returns Access token
   */
  private async exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const appId = this.configService.get('facebook.appId', { infer: true });
    const appSecret = this.configService.get('facebook.appSecret', {
      infer: true,
    });

    if (!appId || !appSecret) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('social.credentialsNotConfigured'),
      });
    }

    const tokenUrl = new URL(
      `${this.baseUrl}/${this.apiVersion}/oauth/access_token`,
    );
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    try {
      const response = await axios.get(tokenUrl.toString(), {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      const data = response.data;

      if (!data.access_token) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('social.wrongToken'),
        });
      }

      return data.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('social.wrongToken'),
        });
      }

      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.wrongToken'),
      });
    }
  }
}
