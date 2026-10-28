import { Injectable, Logger } from '@nestjs/common';
import { CdpService } from './cdp.service';
import { User } from '../users/domain/user';
import { SocialAccount } from '../users/domain/social-account';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import {
  Customer,
  CreateOrUpdateCustomerRequest,
  Source,
  CustomerSource,
  InteractiveChannel,
} from './types/customer.types';

export interface CdpSyncResult {
  customerId: string;
  customerCode?: string;
}

@Injectable()
export class CdpSyncService {
  private readonly logger = new Logger(CdpSyncService.name);

  constructor(private readonly cdpService: CdpService) {}

  private getSocialAccountName(socialAccount: SocialAccount): string {
    if (socialAccount.firstName || socialAccount.lastName) {
      return `${socialAccount.firstName || ''} ${socialAccount.lastName || ''}`.trim();
    }
    return '--';
  }

  private mapSocialAccountToInteractiveChannel(
    socialAccount: SocialAccount,
  ): InteractiveChannel | null {
    const customerName = this.getSocialAccountName(socialAccount);

    switch (socialAccount.provider) {
      case AuthProvidersEnum.zalo:
        return {
          source: Source.ZALO,
          zalo_user_id: socialAccount.socialId,
          customer_name: customerName,
          customer_image_url: socialAccount.avatarUrl || undefined,
        };
      case AuthProvidersEnum.facebook:
        return {
          source: Source.FACEBOOK,
          facebook_user_id: socialAccount.socialId,
          customer_name: customerName,
          customer_image_url: socialAccount.avatarUrl || undefined,
        };
      case AuthProvidersEnum.google:
        return {
          source: Source.GOOGLE,
          google_user_id: socialAccount.socialId,
          customer_name: customerName,
          customer_image_url: socialAccount.avatarUrl || undefined,
        };
      default:
        return null;
    }
  }

  private mapUserToCustomer(user: User): Customer {
    const customerName =
      user.firstName || user.lastName
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : undefined;

    const imageUrl = user.photo?.path || user.socialAvatarUrl;

    const interactiveChannels: InteractiveChannel[] = [];
    const customerSources: CustomerSource[] = [];

    customerSources.push({
      source: Source.CCHAT_WEBSITE,
      customer_name: customerName,
      customer_image_url: imageUrl || undefined,
      cchat_user_id: String(user.id),
    });

    // Map socialAccounts to interactive channels (each with its own name/avatar)
    if (user.socialAccounts && user.socialAccounts.length > 0) {
      for (const socialAccount of user.socialAccounts) {
        const channel =
          this.mapSocialAccountToInteractiveChannel(socialAccount);
        if (channel) {
          interactiveChannels.push(channel);
        }
      }
    }

    const customer: Customer = {
      phone: user.phone || undefined,
      email: user.email || undefined,
      name: customerName,
      status: 'active',
      interactive_channels: interactiveChannels,
      customer_sources: customerSources,
      registration_channel: {
        registration_name: 'CCHAT WEBSITE',
      },
      brand: {
        brand_code: 'CCHAT',
      },
    };

    // Add photo URL if available
    if (imageUrl) {
      customer.image_urls = [imageUrl];
    }

    // If user already has a CDP customer ID, include it for update
    if (user.cdpCustomerId) {
      customer.customer_id = user.cdpCustomerId;
    }

    return customer;
  }

  /**
   * Sync user to CDP
   * First checks if customer already exists by phone number,
   * if found, uses that customer_id to update,
   * otherwise creates a new customer
   */
  async syncUser(user: User): Promise<CdpSyncResult | null> {
    try {
      // If user already has cdpCustomerId, just update
      if (user.cdpCustomerId) {
        return this.updateExistingCustomer(user);
      }

      // If user has phone number, check if customer already exists
      if (user.phone) {
        const existing = await this.findExistingCustomerByPhone(user.phone);
        if (existing) {
          void this.updateCustomerWithId(user, existing.customerId);
          return existing;
        }
      }

      // Customer not found, create new one
      return this.createNewCustomer(user);
    } catch (error) {
      this.logger.error(`Error syncing user ${user.id} to CDP`, error);
      // Don't throw error to prevent blocking user operations
      return null;
    }
  }

  /**
   * Find existing customer on CDP by phone number
   */
  private async findExistingCustomerByPhone(
    phone: string,
  ): Promise<CdpSyncResult | null> {
    try {
      const existingCustomer = await this.cdpService.getCustomer({
        phone,
        brand_code: 'CCHAT',
      });

      if (
        existingCustomer.code === 0 &&
        existingCustomer.customer?.customer_id
      ) {
        this.logger.log(
          `Found existing CDP customer for phone ${phone}: ${existingCustomer.customer.customer_id}`,
        );
        return {
          customerId: existingCustomer.customer.customer_id,
          customerCode: existingCustomer.customer.code,
        };
      }
    } catch (error) {
      // Customer not found or lookup failed, proceed to create
      this.logger.debug(
        `CDP customer not found for phone ${phone}, will create new`,
      );
    }
    return null;
  }

  /**
   * Update existing customer (user already has cdpCustomerId)
   */
  private async updateExistingCustomer(
    user: User,
  ): Promise<CdpSyncResult | null> {
    const customer = this.mapUserToCustomer(user);
    const request: CreateOrUpdateCustomerRequest = { customer };

    this.logger.log(
      `Updating existing CDP customer for user ${user.id} with request body: ${JSON.stringify(request)}`,
    );

    const response = await this.cdpService.createOrUpdateCustomer(request);

    if (response.code === 0 && response.customer?.customer_id) {
      this.logger.log(
        `User ${user.id} synced successfully. CDP Customer ID: ${response.customer.customer_id}`,
      );
      return {
        customerId: response.customer.customer_id,
        customerCode: response.customer.code,
      };
    } else {
      this.logger.error(`Failed to sync user ${user.id}: ${response.message}`);
      return null;
    }
  }

  /**
   * Update customer with found customer_id
   */
  private async updateCustomerWithId(
    user: User,
    customerId: string,
  ): Promise<CdpSyncResult | null> {
    const customer = this.mapUserToCustomer(user);
    customer.customer_id = customerId;
    const request: CreateOrUpdateCustomerRequest = { customer };

    this.logger.log(
      `Updating CDP customer ${customerId} for user ${user.id} with request body: ${JSON.stringify(request)}`,
    );

    const response = await this.cdpService.createOrUpdateCustomer(request);

    if (response.code === 0 && response.customer?.customer_id) {
      this.logger.log(
        `User ${user.id} synced to existing CDP customer ${customerId}`,
      );
      return {
        customerId: response.customer.customer_id,
        customerCode: response.customer.code,
      };
    } else {
      this.logger.error(
        `Failed to update CDP customer ${customerId} for user ${user.id}: ${response.message}`,
      );
      return null;
    }
  }

  /**
   * Create new customer on CDP
   */
  private async createNewCustomer(user: User): Promise<CdpSyncResult | null> {
    const customer = this.mapUserToCustomer(user);
    const request: CreateOrUpdateCustomerRequest = { customer };

    this.logger.log(
      `Creating new CDP customer for user ${user.id} with request body: ${JSON.stringify(request)}`,
    );

    const response = await this.cdpService.createOrUpdateCustomer(request);

    if (response.code === 0 && response.customer?.customer_id) {
      this.logger.log(
        `User ${user.id} synced successfully. CDP Customer ID: ${response.customer.customer_id}`,
      );
      return {
        customerId: response.customer.customer_id,
        customerCode: response.customer.code,
      };
    } else {
      this.logger.error(`Failed to sync user ${user.id}: ${response.message}`);
      return null;
    }
  }
}
