import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../users/users.service';
import { SessionService } from '../../session/session.service';
import { TokenService } from './token.service';
import { SocialInterface } from '../../social/interfaces/social.interface';
import { LoginResponseDto } from '../dto/login-response.dto';
import { StatusEnum } from '../../statuses/statuses.enum';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../../users/domain/user';
import { throwException } from '../../utils/errors/throw-exception';
import { AuthProvidersEnum } from '../auth-providers.enum';
import { SocialAccount } from '../../users/domain/social-account';

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Handles Google/Facebook/Apple login
   */
  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: NullableType<User> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<User> = null;

    if (socialEmail) {
      userByEmail = await this.usersService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.usersService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider,
      });
    }

    // Build social account object from social data
    const socialAccount = this.buildSocialAccount(
      authProvider as AuthProvidersEnum,
      socialData,
    );

    if (user) {
      let needsUpdate = false;
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
        needsUpdate = true;
      }
      // Update social avatar URL if it has changed
      if (socialData.picture && user.socialAvatarUrl !== socialData.picture) {
        user.socialAvatarUrl = socialData.picture;
        needsUpdate = true;
      }
      // Update social account in the list
      const updated = this.upsertSocialAccount(user, socialAccount);
      if (updated) {
        needsUpdate = true;
      }
      if (needsUpdate) {
        await this.usersService.update(user.id, user);
      }
    } else if (userByEmail) {
      user = userByEmail;
      // Add social account to existing user found by email
      const updated = this.upsertSocialAccount(user, socialAccount);
      if (updated) {
        await this.usersService.update(user.id, user);
      }
    } else if (socialData.id) {
      user = await this.usersService.create({
        email: socialEmail ?? null,
        firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null,
        socialId: socialData.id,
        socialAvatarUrl: socialData.picture ?? null,
        provider: authProvider,
        status: StatusEnum.active,
        socialAccounts: [socialAccount],
      });

      user = await this.usersService.findById(user.id);
    }

    if (!user) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    if (user.status !== StatusEnum.active) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.accountInactive'),
      });
    }

    const session = await this.sessionService.createForUser(user);
    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.tokenService.getTokensData({
      id: user.id,
      sessionId: session.id,
      hash: session.hash,
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  private buildSocialAccount(
    provider: AuthProvidersEnum,
    socialData: SocialInterface,
  ): SocialAccount {
    const socialAccount = new SocialAccount();
    socialAccount.provider = provider;
    socialAccount.socialId = socialData.id;
    socialAccount.email = socialData.email?.toLowerCase() ?? null;
    socialAccount.firstName = socialData.firstName ?? null;
    socialAccount.lastName = socialData.lastName ?? null;
    socialAccount.avatarUrl = socialData.picture ?? null;
    socialAccount.connectedAt = new Date();
    return socialAccount;
  }

  /**
   * Adds or updates a social account in the user's socialAccounts list.
   * Returns true if the list was modified.
   */
  private upsertSocialAccount(
    user: User,
    socialAccount: SocialAccount,
  ): boolean {
    if (!user.socialAccounts) {
      user.socialAccounts = [];
    }

    const existingIndex = user.socialAccounts.findIndex(
      (sa) =>
        sa.provider === socialAccount.provider &&
        sa.socialId === socialAccount.socialId,
    );

    if (existingIndex >= 0) {
      const existing = user.socialAccounts[existingIndex];
      // Update existing social account if data has changed
      if (
        existing.email !== socialAccount.email ||
        existing.firstName !== socialAccount.firstName ||
        existing.lastName !== socialAccount.lastName ||
        existing.avatarUrl !== socialAccount.avatarUrl
      ) {
        user.socialAccounts[existingIndex] = {
          ...existing,
          email: socialAccount.email,
          firstName: socialAccount.firstName,
          lastName: socialAccount.lastName,
          avatarUrl: socialAccount.avatarUrl,
        };
        return true;
      }
      return false;
    }

    // Add new social account
    user.socialAccounts.push(socialAccount);
    return true;
  }
}
