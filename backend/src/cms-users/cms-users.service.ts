import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterCmsUserDto, SortCmsUserDto } from './dto/query-cms-user.dto';
import { CmsUserRepository } from './domain/cms-user.repository';
import { CmsUser } from './domain/cms-user';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { FilesService } from '../files/files.service';
import { AccountTypeEnum } from './permissions/account-type.enum';
import { ModulePermission } from './permissions/module-permission.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { File } from '../files/domain/file';
import { UpdateCmsUserDto } from './dto/update-cms-user.dto';
import { throwException } from '../utils/errors/throw-exception';
import { AffiliatesService } from '../affiliates/affiliates.service';
import { MailService } from '../mail/mail.service';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class CmsUsersService {
  constructor(
    private readonly cmsUsersRepository: CmsUserRepository,
    private readonly filesService: FilesService,
    private readonly affiliatesService: AffiliatesService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async create(createCmsUserDto: CreateCmsUserDto): Promise<CmsUser> {
    let password: string;
    let plainPassword: string | undefined;
    let firstName = createCmsUserDto.firstName;
    const lastName = createCmsUserDto.lastName;
    let email = createCmsUserDto.email;
    let phone = createCmsUserDto.phone;

    const accountType =
      createCmsUserDto.accountType ?? AccountTypeEnum.website_admin;

    if (accountType === AccountTypeEnum.affiliate) {
      // Affiliate account: validate affiliateId exists
      if (!createCmsUserDto.affiliateId) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('cms-user.affiliateIdRequired'),
        });
      }

      const affiliate = await this.affiliatesService.findById(
        createCmsUserDto.affiliateId,
      );
      if (!affiliate) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('cms-user.affiliateNotFound'),
        });
      }

      // Check if affiliate already has a CMS account
      const existingAffiliateAccount =
        await this.cmsUsersRepository.findByAffiliateId(
          createCmsUserDto.affiliateId,
        );
      if (existingAffiliateAccount) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('cms-user.affiliateAlreadyLinked'),
        });
      }

      // Auto-populate from affiliate data
      if (affiliate.name) {
        firstName = affiliate.name;
      }
      if (affiliate.email) {
        email = affiliate.email;
      }
      if (affiliate.phone) {
        phone = affiliate.phone;
      }

      // Generate random password for affiliate accounts
      const randomPassword = crypto.randomBytes(16).toString('hex');
      plainPassword = randomPassword;
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(randomPassword, salt);
    } else {
      // Website admin: password is required
      if (!createCmsUserDto.password) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('cms-user.passwordRequired'),
        });
      }
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createCmsUserDto.password, salt);
    }

    const existingUser = await this.cmsUsersRepository.findByEmail(email);
    if (existingUser) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('user.emailAlreadyExists'),
      });
    }

    // If a soft-deleted user holds the same email, free up the unique index
    const deletedUserWithEmail =
      await this.cmsUsersRepository.findByEmailAll(email);
    if (deletedUserWithEmail) {
      await this.cmsUsersRepository.freeEmail(deletedUserWithEmail.id);
    }

    let photo: File | null | undefined = undefined;

    if (createCmsUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createCmsUserDto.photo.id,
      );
      if (!fileObject) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.imageNotExists'),
        });
      }
      photo = fileObject;
    } else if (createCmsUserDto.photo === null) {
      photo = null;
    }

    // Strip super_admin from input – it can only be set directly in the database
    const permissions = (createCmsUserDto.permissions ?? []).filter(
      (p) => p !== ModulePermission.super_admin,
    );

    let status: StatusEnum | undefined = undefined;

    if (
      typeof createCmsUserDto.status !== 'undefined' &&
      createCmsUserDto.status !== null
    ) {
      const statusObject = Object.values(StatusEnum).filter(
        (value): value is StatusEnum => typeof value === 'number',
      );
      if (!statusObject.includes(createCmsUserDto.status)) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.statusNotExists'),
        });
      }

      status = createCmsUserDto.status;
    }

    const createdUser = await this.cmsUsersRepository.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      photo,
      accountType,
      permissions,
      affiliateId: createCmsUserDto.affiliateId ?? null,
      status: status ?? StatusEnum.active,
    });

    if (accountType === AccountTypeEnum.affiliate && plainPassword) {
      const cmsDomain = this.configService.get('app.cmsDomain', {
        infer: true,
      });
      await this.mailService.cmsUserWelcome({
        to: email,
        data: {
          email,
          password: plainPassword,
          loginUrl: `${cmsDomain}/auth/login`,
        },
      });
    }

    return createdUser;
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCmsUserDto | null;
    sortOptions?: SortCmsUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<CmsUser>> {
    return this.cmsUsersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: CmsUser['id']): Promise<NullableType<CmsUser>> {
    return this.cmsUsersRepository.findById(id);
  }

  findByIds(ids: CmsUser['id'][]): Promise<CmsUser[]> {
    return this.cmsUsersRepository.findByIds(ids);
  }

  findByEmail(email: CmsUser['email']): Promise<NullableType<CmsUser>> {
    return this.cmsUsersRepository.findByEmail(email);
  }

  async update(
    id: CmsUser['id'],
    updateCmsUserDto: UpdateCmsUserDto,
  ): Promise<CmsUser | null> {
    let password: string | undefined = undefined;

    if (updateCmsUserDto.password) {
      const cmsUserObject = await this.cmsUsersRepository.findById(id);

      if (
        cmsUserObject &&
        cmsUserObject?.password !== updateCmsUserDto.password
      ) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateCmsUserDto.password, salt);
      }
    }

    let email: string | undefined = undefined;

    if (updateCmsUserDto.email) {
      const cmsUserObject = await this.cmsUsersRepository.findByEmail(
        updateCmsUserDto.email,
      );

      if (cmsUserObject && cmsUserObject.id !== id) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.emailAlreadyExists'),
        });
      }

      email = updateCmsUserDto.email;
    }

    let photo: File | null | undefined = undefined;

    if (updateCmsUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        updateCmsUserDto.photo.id,
      );
      if (!fileObject) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.imageNotExists'),
        });
      }
      photo = fileObject;
    } else if (updateCmsUserDto.photo === null) {
      photo = null;
    }

    let status: StatusEnum | undefined = undefined;

    if (
      typeof updateCmsUserDto.status !== 'undefined' &&
      updateCmsUserDto.status !== null
    ) {
      const statusObject = Object.values(StatusEnum).filter(
        (value): value is StatusEnum => typeof value === 'number',
      );
      if (!statusObject.includes(updateCmsUserDto.status)) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('user.statusNotExists'),
        });
      }

      status = updateCmsUserDto.status;
    }

    // Build update payload with only defined fields
    const updatePayload: Partial<CmsUser> = {};

    if (typeof updateCmsUserDto.firstName !== 'undefined') {
      updatePayload.firstName = updateCmsUserDto.firstName;
    }
    if (typeof updateCmsUserDto.lastName !== 'undefined') {
      updatePayload.lastName = updateCmsUserDto.lastName;
    }
    if (typeof updateCmsUserDto.phone !== 'undefined') {
      updatePayload.phone = updateCmsUserDto.phone;
    }
    if (typeof email !== 'undefined') {
      updatePayload.email = email;
    }
    if (typeof password !== 'undefined') {
      updatePayload.password = password;
    }
    if (typeof photo !== 'undefined') {
      updatePayload.photo = photo;
    }
    if (typeof updateCmsUserDto.permissions !== 'undefined') {
      // Preserve super_admin if the user already has it (cannot be set/removed via API)
      const currentUser = await this.cmsUsersRepository.findById(id);
      if (currentUser?.permissions?.includes(ModulePermission.super_admin)) {
        updatePayload.permissions = [
          ...updateCmsUserDto.permissions.filter(
            (p) => p !== ModulePermission.super_admin,
          ),
          ModulePermission.super_admin,
        ];
      } else {
        updatePayload.permissions = updateCmsUserDto.permissions;
      }
    }
    if (typeof status !== 'undefined') {
      updatePayload.status = status;
    }

    return this.cmsUsersRepository.update(id, updatePayload);
  }

  async remove(id: CmsUser['id']): Promise<void> {
    await this.cmsUsersRepository.remove(id);
  }
}
