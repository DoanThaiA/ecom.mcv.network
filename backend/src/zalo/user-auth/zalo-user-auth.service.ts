import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { randomBytes } from 'crypto';
import axios from 'axios';
import { SocialInterface } from '../../social/interfaces/social.interface';
import { ZaloUserLoginDto } from '../dto/zalo-user-login.dto';
import { AllConfigType } from '../../config/config.type';
import { ZaloTokenResponse, ZaloUserInfo } from '../interfaces/zalo.interface';
import { OAuthStateSchemaClass } from '../../social/model/oauth-state.schema';
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from '../../utils/security/pkce.util';
import { sendVnProxiedRequest } from '../../utils/http/vn-proxy.util';

@Injectable()
export class ZaloUserAuthService {
  // Zalo User OAuth endpoints
  private readonly authUrl = 'https://oauth.zaloapp.com/v4/permission';
  private readonly tokenUrl = 'https://oauth.zaloapp.com/v4/access_token';
  private readonly userInfoUrl = 'https://graph.zalo.me/v2.0/me';

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
    @InjectModel(OAuthStateSchemaClass.name)
    private readonly oauthStateModel: Model<OAuthStateSchemaClass>,
  ) {}

  /**
   * Generates the Zalo OAuth authorization URL with PKCE.
   * Creates and stores a code verifier associated with a random state.
   * @returns Object containing the authorization URL
   */
  async getAuthorizationUrl(returnUrl?: string): Promise<{ url: string }> {
    const appId = this.configService.get('zalo.appId', { infer: true });

    if (!appId) {
      throw new HttpException(
        this.i18n.t('social.credentialsNotConfigured'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Generate a unique state parameter
    const state = randomBytes(16).toString('hex');

    // Store the code verifier with state (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Clean up any existing expired states for this flow
    await this.oauthStateModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    // Save the state
    await this.oauthStateModel.create({
      state,
      provider: 'zalo',
      codeVerifier,
      expiresAt,
    });

    // Get the redirect URI (the login callback endpoint)
    const websiteDomain = this.configService.getOrThrow('app.websiteDomain', {
      infer: true,
    });
    const redirectUri = `${websiteDomain}/auth/zalo`;

    // Embed returnUrl in state if provided (relative paths only)
    let stateWithReturnUrl = state;
    if (returnUrl && returnUrl.startsWith('/') && returnUrl.length <= 500) {
      stateWithReturnUrl = `${state}|returnUrl=${encodeURIComponent(returnUrl)}`;
    }

    // Build the authorization URL
    const authUrl = new URL(this.authUrl);
    authUrl.searchParams.set('app_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('state', stateWithReturnUrl);

    return {
      url: authUrl.toString(),
    };
  }

  /**
   * Retrieves a Zalo user profile using the provided OAuth code and state.
   * First exchanges the code for an access token using PKCE, then fetches the user's profile.
   * @param loginDto DTO containing the OAuth code and state from Zalo authorization.
   * @returns Normalized user profile in internal SocialInterface format.
   */
  async getProfileByOAuthCode(
    loginDto: ZaloUserLoginDto,
  ): Promise<SocialInterface> {
    try {
      // Step 1: Exchange OAuth code for access token
      const accessToken = await this.exchangeCodeForToken(
        loginDto.code,
        loginDto.state,
      );

      // Step 2: Get user profile information
      const userInfo = await this.getUserInfo(accessToken);

      // Map Zalo data to our internal social user interface
      return {
        id: userInfo.id,
        firstName: userInfo.name || '',
        lastName: '',
        email: undefined, // Zalo doesn't provide email in basic profile
        picture: userInfo.picture?.data?.url,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.name === 'TimeoutError') {
        throw new HttpException(
          this.i18n.t('social.zaloApiTimeout'),
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      throw new HttpException(
        this.i18n.t('social.failedToGetProfile'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Exchanges OAuth authorization code for access token using PKCE.
   * This requires the app secret and code verifier and must be done on the backend for security.
   * @param code OAuth authorization code from Zalo.
   * @param state State parameter to retrieve the code verifier.
   * @returns Access token string.
   */
  private async exchangeCodeForToken(
    code: string,
    state: string,
  ): Promise<string> {
    try {
      const appId = this.configService.get('zalo.appId', { infer: true });
      const appSecret = this.configService.get('zalo.appSecret', {
        infer: true,
      });

      // Application credentials must be configured properly
      if (!appId || !appSecret) {
        throw new HttpException(
          this.i18n.t('social.credentialsNotConfigured'),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Strip any appended data (e.g. |returnUrl=... or |action=link) from state before DB lookup
      const baseState = state.split('|')[0];

      // Retrieve the code verifier from storage
      const oauthState = await this.oauthStateModel.findOne({
        state: baseState,
        provider: 'zalo',
      });

      if (!oauthState) {
        throw new HttpException(
          this.i18n.t('social.invalidOrExpiredState'),
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if state is expired
      if (oauthState.expiresAt < new Date()) {
        await this.oauthStateModel.deleteMany({
          state: baseState,
          provider: 'zalo',
        });
        throw new HttpException(
          this.i18n.t('social.invalidOrExpiredState'),
          HttpStatus.BAD_REQUEST,
        );
      }

      const codeVerifier = oauthState.codeVerifier;

      // Prepare the token exchange request with form data
      const formData = new URLSearchParams();
      formData.append('code', code);
      formData.append('app_id', appId);
      formData.append('grant_type', 'authorization_code');
      formData.append('code_verifier', codeVerifier);

      try {
        const response = await axios.post<ZaloTokenResponse>(
          this.tokenUrl,
          formData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              secret_key: appSecret,
            },
            timeout: 10000, // 10 second timeout
          },
        );

        // Delete the used state
        await this.oauthStateModel.deleteMany({
          state: baseState,
          provider: 'zalo',
        });

        const data: ZaloTokenResponse = response.data;

        if (!data.access_token) {
          throw new HttpException(
            this.i18n.t('social.invalidTokenResponse'),
            HttpStatus.BAD_REQUEST,
          );
        }

        return data.access_token;
      } catch (error) {
        // Delete the used state even on error
        await this.oauthStateModel.deleteMany({
          state: baseState,
          provider: 'zalo',
        });

        if (error instanceof HttpException) {
          throw error;
        }

        if (axios.isAxiosError(error)) {
          throw new HttpException(
            error.response?.data?.error?.message ||
              this.i18n.t('social.failedToExchangeToken'),
            error.response?.status || HttpStatus.BAD_REQUEST,
          );
        }

        throw new HttpException(
          this.i18n.t('social.failedToExchangeToken'),
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        this.i18n.t('social.failedToExchangeToken'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Retrieves user information from Zalo using an access token.
   * Uses VN proxy to bypass IP restrictions if configured.
   * @param accessToken Zalo access token.
   * @returns User information from Zalo.
   */
  private async getUserInfo(accessToken: string): Promise<ZaloUserInfo> {
    try {
      const userInfoUrl = new URL(this.userInfoUrl);
      userInfoUrl.searchParams.set('fields', 'id,name,picture');

      const response = await sendVnProxiedRequest<ZaloUserInfo>({
        url: userInfoUrl.toString(),
        method: 'GET',
        headers: {
          Accept: 'application/json',
          access_token: accessToken,
        },
        timeout: 10000,
      });
      const data = response.data;

      console.log('Zalo user info response:', data);

      // Ensure required fields are present in the response
      if (!data.name) {
        throw new HttpException(
          this.i18n.t('social.invalidZaloProfile'),
          HttpStatus.BAD_REQUEST,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new HttpException(
            this.i18n.t('social.zaloApiTimeout'),
            HttpStatus.REQUEST_TIMEOUT,
          );
        }

        throw new HttpException(
          error.response?.data?.error?.message ||
            this.i18n.t('social.zaloApiError'),
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        this.i18n.t('social.failedToGetProfile'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
