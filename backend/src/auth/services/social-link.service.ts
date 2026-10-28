import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../users/users.service';
import { SocialInterface } from '../../social/interfaces/social.interface';
import { User } from '../../users/domain/user';
import { SocialAccount } from '../../users/domain/social-account';
import { AuthProvidersEnum } from '../auth-providers.enum';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class SocialLinkService {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Link a social account to the current user
   */
  async linkSocialAccount(
    userId: string | number,
    provider: AuthProvidersEnum,
    socialData: SocialInterface,
  ): Promise<User> {
    // Get current user
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    // Check if this social account is already linked to ANOTHER user
    const existingUser =
      await this.usersService.findBySocialAccountExcludingUser({
        socialId: socialData.id,
        provider,
        excludeUserId: userId,
      });

    if (existingUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.socialAccountAlreadyLinked'),
      });
    }

    // Check if user already has this exact provider+socialId linked
    const alreadyLinked = currentUser.socialAccounts?.some(
      (sa) => sa.provider === provider && sa.socialId === socialData.id,
    );

    if (alreadyLinked) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.socialAccountAlreadyConnected'),
      });
    }

    // Build social account object
    const socialAccount = this.buildSocialAccount(provider, socialData);

    // Add to socialAccounts array
    const socialAccounts = currentUser.socialAccounts || [];
    socialAccounts.push(socialAccount);

    // Update user
    await this.usersService.update(userId, { socialAccounts });

    // Return updated user
    const updatedUser = await this.usersService.findById(userId);
    if (!updatedUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    return updatedUser;
  }

  /**
   * Unlink a social account from the current user
   */
  async unlinkSocialAccount(
    userId: string | number,
    provider: AuthProvidersEnum,
  ): Promise<User> {
    // Get current user
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    // Find the social account to unlink
    const socialAccountIndex = currentUser.socialAccounts?.findIndex(
      (sa) => sa.provider === provider,
    );

    if (socialAccountIndex === undefined || socialAccountIndex < 0) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.providerNotLinked'),
      });
    }

    const socialAccount = currentUser.socialAccounts![socialAccountIndex];

    // Check if this is the primary/initial social account
    if (
      currentUser.provider === provider &&
      currentUser.socialId === socialAccount.socialId
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.cannotUnlinkPrimaryAccount'),
      });
    }

    // Check if user has at least one other auth method after unlinking
    const hasPassword = !!currentUser.password;
    const hasPhone = !!currentUser.phone;
    const hasEmail = !!currentUser.email && currentUser.provider === 'email';
    const remainingSocialAccounts =
      (currentUser.socialAccounts?.length ?? 0) - 1;

    // The primary social account (if exists) counts as one auth method
    const hasPrimarySocial =
      currentUser.provider !== 'email' && currentUser.provider !== 'phone';

    const totalAuthMethods =
      (hasPassword ? 1 : 0) +
      (hasPhone ? 1 : 0) +
      (hasEmail ? 1 : 0) +
      (hasPrimarySocial ? 1 : 0) +
      remainingSocialAccounts;

    if (totalAuthMethods < 1) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('social.cannotUnlinkLastAuthMethod'),
      });
    }

    // Remove from socialAccounts array
    const socialAccounts = [...(currentUser.socialAccounts || [])];
    socialAccounts.splice(socialAccountIndex, 1);

    // Update user
    await this.usersService.update(userId, { socialAccounts });

    // Return updated user
    const updatedUser = await this.usersService.findById(userId);
    if (!updatedUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('auth.userNotFound'),
      });
    }

    return updatedUser;
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
}
