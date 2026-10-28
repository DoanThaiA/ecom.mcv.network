import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UserRepository } from './domain/user.repository';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { File } from '../files/domain/file';
import { UpdateUserDto } from './dto/update-user.dto';
import { throwException } from '../utils/errors/throw-exception';
import { CdpSyncService } from '../cdp/cdp-sync.service';
import { RegistrationVoucherService } from '../registration-voucher/registration-voucher.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
    private readonly i18n: I18nService,
    private readonly cdpSyncService: CdpSyncService,
    private readonly registrationVoucherService: RegistrationVoucherService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    options: { hashPassword?: boolean } = { hashPassword: true },
  ): Promise<User> {
    let password: string | undefined = undefined;

    if (createUserDto.password) {
      if (options.hashPassword) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(createUserDto.password, salt);
      } else {
        password = createUserDto.password;
      }
    }

    let email: string | null = null;
    let existingInactiveUser: User | null = null;

    if (createUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (userObject) {
        if (userObject.status === StatusEnum.inactive) {
          existingInactiveUser = userObject;
        } else {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('user.emailAlreadyExists'),
          });
        }
      }
      email = createUserDto.email;
    }

    let phone: string | null = null;

    if (createUserDto.phone) {
      const userObject = await this.usersRepository.findByPhone(
        createUserDto.phone,
      );
      if (userObject) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.phoneAlreadyExists'),
        });
      }
      phone = createUserDto.phone;
    }

    let photo: File | null | undefined = undefined;

    if (createUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createUserDto.photo.id,
      );
      if (!fileObject) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.imageNotExists'),
        });
      }
      photo = fileObject;
    } else if (createUserDto.photo === null) {
      photo = null;
    }

    let status: StatusEnum | undefined = undefined;

    if (
      typeof createUserDto.status !== 'undefined' &&
      createUserDto.status !== null
    ) {
      const statusObject = Object.values(StatusEnum).filter(
        (value): value is StatusEnum => typeof value === 'number',
      );
      if (!statusObject.includes(createUserDto.status)) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.statusNotExists'),
        });
      }

      status = createUserDto.status;
    }

    // If existing inactive user found, update it instead of creating new
    if (existingInactiveUser) {
      const updatedUser = await this.usersRepository.update(
        existingInactiveUser.id,
        {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: email,
          phone: phone,
          password: password,
          photo: photo,
          socialAvatarUrl: createUserDto.socialAvatarUrl,
          status: status,
          provider: createUserDto.provider ?? AuthProvidersEnum.email,
          socialId: createUserDto.socialId,
          socialAccounts: createUserDto.socialAccounts,
        },
      );

      // Sync to CDP asynchronously
      if (updatedUser) {
        this.cdpSyncService
          .syncUser(updatedUser)
          .then((cdpResult) => {
            if (
              cdpResult &&
              cdpResult.customerId !== updatedUser.cdpCustomerId
            ) {
              this.usersRepository
                .update(updatedUser.id, {
                  cdpCustomerId: cdpResult.customerId,
                  cdpCustomerCode: cdpResult.customerCode,
                })
                .catch((error) => {
                  this.logger.error('Failed to update CDP customer ID:', error);
                });
            }
          })
          .catch((error) => {
            this.logger.error('CDP sync failed:', error);
          });

        return updatedUser;
      }
    }

    const user = await this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: email,
      phone: phone,
      password: password,
      photo: photo,
      socialAvatarUrl: createUserDto.socialAvatarUrl,
      status: status,
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
      socialId: createUserDto.socialId,
      socialAccounts: createUserDto.socialAccounts,
    });

    // Sync to CDP asynchronously (don't await to avoid blocking)
    this.cdpSyncService
      .syncUser(user)
      .then((cdpResult) => {
        if (cdpResult && cdpResult.customerId !== user.cdpCustomerId) {
          this.usersRepository
            .update(user.id, {
              cdpCustomerId: cdpResult.customerId,
              cdpCustomerCode: cdpResult.customerCode,
            })
            .catch((error) => {
              this.logger.error('Failed to update CDP customer ID:', error);
            });
        }

        // Send registration voucher via ZNS for new users with CDP
        if (cdpResult && user.phone) {
          this.registrationVoucherService
            .sendRegistrationVoucher(
              user,
              cdpResult.customerCode,
              cdpResult.customerId,
            )
            .catch((error) => {
              this.logger.error('Failed to send registration voucher:', error);
            });
        }
      })
      .catch((error) => {
        this.logger.error('CDP sync failed:', error);
      });

    return user;
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<User>> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findByPhone(phone: User['phone']): Promise<NullableType<User>> {
    return this.usersRepository.findByPhone(phone);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  findBySocialAccountExcludingUser({
    socialId,
    provider,
    excludeUserId,
  }: {
    socialId: string;
    provider: string;
    excludeUserId: User['id'];
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialAccountExcludingUser({
      socialId,
      provider,
      excludeUserId,
    });
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    let password: string | undefined = undefined;

    if (updateUserDto.password) {
      const userObject = await this.usersRepository.findById(id);

      if (userObject && userObject?.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateUserDto.password, salt);
      }
    }

    let email: string | null | undefined = undefined;

    if (updateUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      if (userObject && userObject.id !== id) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.emailAlreadyExists'),
        });
      }

      email = updateUserDto.email;
    } else if (updateUserDto.email === null) {
      email = null;
    }

    let phone: string | null | undefined = undefined;

    if (updateUserDto.phone) {
      const userObject = await this.usersRepository.findByPhone(
        updateUserDto.phone,
      );

      if (userObject && userObject.id !== id) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.phoneAlreadyExists'),
        });
      }

      phone = updateUserDto.phone;
    } else if (updateUserDto.phone === null) {
      phone = null;
    }

    let photo: File | null | undefined = undefined;

    if (updateUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        updateUserDto.photo.id,
      );
      if (!fileObject) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.imageNotExists'),
        });
      }
      photo = fileObject;
    } else if (updateUserDto.photo === null) {
      photo = null;
    }

    let status: StatusEnum | undefined = undefined;

    if (
      typeof updateUserDto.status !== 'undefined' &&
      updateUserDto.status !== null
    ) {
      const statusObject = Object.values(StatusEnum).filter(
        (value): value is StatusEnum => typeof value === 'number',
      );
      if (!statusObject.includes(updateUserDto.status)) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.statusNotExists'),
        });
      }

      status = updateUserDto.status;
    }

    const updatedUser = await this.usersRepository.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email,
      phone,
      password,
      photo,
      socialAvatarUrl: updateUserDto.socialAvatarUrl,
      status,
      provider: updateUserDto.provider,
      socialId: updateUserDto.socialId,
      socialAccounts: updateUserDto.socialAccounts,
    });

    // Sync to CDP asynchronously (don't await to avoid blocking)
    if (updatedUser) {
      this.cdpSyncService
        .syncUser(updatedUser)
        .then((cdpResult) => {
          if (cdpResult && cdpResult.customerId !== updatedUser.cdpCustomerId) {
            this.usersRepository
              .update(updatedUser.id, {
                cdpCustomerId: cdpResult.customerId,
                cdpCustomerCode: cdpResult.customerCode,
              })
              .catch((error) => {
                this.logger.error('Failed to update CDP customer ID:', error);
              });
          }
        })
        .catch((error) => {
          this.logger.error('CDP sync failed:', error);
        });
    }

    return updatedUser;
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }
}
