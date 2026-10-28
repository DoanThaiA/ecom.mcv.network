import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PhoneLinkService } from '../../../src/auth/services/phone-link.service';
import { UsersService } from '../../../src/users/users.service';
import { OtpService } from '../../../src/auth/services/otp.service';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import { User } from '../../../src/users/domain/user';
import { OtpDeliveryMethod } from '../../../src/auth/dto/auth-phone-register.dto';
import { StatusEnum } from '../../../src/statuses/statuses.enum';

describe('PhoneLinkService', () => {
  let service: PhoneLinkService;
  let usersService: jest.Mocked<UsersService>;
  let otpService: jest.Mocked<OtpService>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let i18n: jest.Mocked<I18nService>;
  let loggerErrorSpy: jest.SpyInstance;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    phone: null,
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    provider: 'email',
    socialId: null,
    socialAccounts: [],
    status: StatusEnum.active,
    photo: null,
    cdpCustomerId: 'cdp-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn(),
      findByPhone: jest.fn(),
      update: jest.fn(),
    };

    const mockOtpService = {
      checkRateLimit: jest.fn().mockResolvedValue(undefined),
      generateOtp: jest.fn(),
      createPhoneLinkOtpRecord: jest.fn().mockResolvedValue(undefined),
      sendOtp: jest.fn().mockResolvedValue(undefined),
      validatePhoneLinkOtp: jest.fn().mockResolvedValue(undefined),
      deleteOtpsByPhone: jest.fn().mockResolvedValue(undefined),
    };

    const mockOrderRepository = {
      findGuestOrdersByPhone: jest.fn(),
      assignOrdersToUser: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneLinkService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<PhoneLinkService>(PhoneLinkService);
    usersService = module.get(UsersService);
    otpService = module.get(OtpService);
    orderRepository = module.get(OrderRepository);
    i18n = module.get(I18nService);
  });

  beforeAll(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterAll(() => {
    loggerErrorSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestLinkOtp', () => {
    const requestDto = {
      phone: '0901234567',
      otpMethod: OtpDeliveryMethod.ZNS,
    };

    it('should request link OTP successfully', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      otpService.generateOtp.mockReturnValue('123456');

      await service.requestLinkOtp('user-123', requestDto);

      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(otpService.checkRateLimit).toHaveBeenCalledWith('0901234567');
      expect(otpService.generateOtp).toHaveBeenCalled();
      expect(otpService.createPhoneLinkOtpRecord).toHaveBeenCalledWith({
        phone: '0901234567',
        otp: '123456',
        userId: 'user-123',
      });
      expect(otpService.sendOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
        OtpDeliveryMethod.ZNS,
      );
    });

    it('should throw error when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.requestLinkOtp('non-existent', requestDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(otpService.sendOtp).not.toHaveBeenCalled();
    });

    it('should throw error when phone already linked to current user', async () => {
      const userWithPhone = { ...mockUser, phone: '0901234567' };
      usersService.findById.mockResolvedValue(userWithPhone);

      await expect(
        service.requestLinkOtp('user-123', requestDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.phoneAlreadyLinked');
      expect(otpService.sendOtp).not.toHaveBeenCalled();
    });

    it('should throw error when phone already used by another user', async () => {
      const otherUser = { ...mockUser, id: 'other-user', phone: '0901234567' };
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByPhone.mockResolvedValue(otherUser);

      await expect(
        service.requestLinkOtp('user-123', requestDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.phoneAlreadyExists');
      expect(usersService.findByPhone).toHaveBeenCalledWith('0901234567');
      expect(otpService.sendOtp).not.toHaveBeenCalled();
    });

    it('should throw error when rate limit exceeded', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      otpService.checkRateLimit.mockRejectedValue(
        new Error('Rate limit exceeded'),
      );

      await expect(
        service.requestLinkOtp('user-123', requestDto),
      ).rejects.toThrow('Rate limit exceeded');

      expect(otpService.sendOtp).not.toHaveBeenCalled();
    });

    it('should use default OTP method if not provided', async () => {
      const requestDtoNoMethod = { phone: '0901234567' };
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      otpService.generateOtp.mockReturnValue('123456');

      await service.requestLinkOtp('user-123', requestDtoNoMethod);

      expect(otpService.sendOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
        OtpDeliveryMethod.ZNS, // Default
      );
    });

    it('should allow linking phone to same user if already exists', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.findByPhone.mockResolvedValue(mockUser); // Same user
      otpService.generateOtp.mockReturnValue('123456');

      await service.requestLinkOtp('user-123', requestDto);

      expect(otpService.sendOtp).toHaveBeenCalled();
    });
  });

  describe('verifyLinkOtp', () => {
    const verifyDto = {
      phone: '0901234567',
      otp: '123456',
      password: 'NewPassword123!',
    };

    it('should verify OTP and link phone with password successfully', async () => {
      const userWithoutPhone = { ...mockUser, phone: null };
      const updatedUser = { ...mockUser, phone: '0901234567' };

      usersService.findById.mockResolvedValueOnce(userWithoutPhone);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);
      orderRepository.findGuestOrdersByPhone.mockResolvedValue([]);

      const result = await service.verifyLinkOtp('user-123', verifyDto);

      expect(result).toEqual(updatedUser);
      expect(otpService.validatePhoneLinkOtp).toHaveBeenCalledWith(
        '0901234567',
        '123456',
        'user-123',
      );
      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        phone: '0901234567',
        password: 'NewPassword123!',
      });
      expect(otpService.deleteOtpsByPhone).toHaveBeenCalledWith('0901234567');
    });

    it('should verify OTP and link phone without password if user has password', async () => {
      const verifyDtoNoPassword = {
        phone: '0901234567',
        otp: '123456',
      };

      const updatedUser = { ...mockUser, phone: '0901234567' };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);
      orderRepository.findGuestOrdersByPhone.mockResolvedValue([]);

      const result = await service.verifyLinkOtp(
        'user-123',
        verifyDtoNoPassword,
      );

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        phone: '0901234567',
      });
    });

    it('should throw error when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.verifyLinkOtp('non-existent', verifyDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when OTP validation fails', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      otpService.validatePhoneLinkOtp.mockRejectedValue(
        new Error('Invalid OTP'),
      );

      await expect(
        service.verifyLinkOtp('user-123', verifyDto),
      ).rejects.toThrow('Invalid OTP');

      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when phone taken by another user (race condition)', async () => {
      const otherUser = { ...mockUser, id: 'other-user', phone: '0901234567' };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findByPhone.mockResolvedValue(otherUser);

      await expect(
        service.verifyLinkOtp('user-123', verifyDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.phoneAlreadyExists');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw error when social user tries to link phone without password', async () => {
      const socialUser = { ...mockUser, password: undefined };
      const verifyDtoNoPassword = {
        phone: '0901234567',
        otp: '123456',
      };

      usersService.findById.mockResolvedValue(socialUser);

      await expect(
        service.verifyLinkOtp('user-123', verifyDtoNoPassword),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.passwordRequiredForPhoneLink');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should allow social user to link phone with password', async () => {
      const socialUser = { ...mockUser, password: undefined };
      const updatedUser = {
        ...mockUser,
        phone: '0901234567',
        password: 'hashed',
      };

      usersService.findById.mockResolvedValueOnce(socialUser);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);
      orderRepository.findGuestOrdersByPhone.mockResolvedValue([]);

      const result = await service.verifyLinkOtp('user-123', verifyDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        phone: '0901234567',
        password: 'NewPassword123!',
      });
    });

    it('should throw error when user not found after update', async () => {
      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValueOnce(null);

      await expect(
        service.verifyLinkOtp('user-123', verifyDto),
      ).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      expect(i18n.t).toHaveBeenCalledWith('auth.userNotFound');
    });

    it('should merge guest orders when linking phone', async () => {
      const guestOrders = [
        { id: 'order-1', orderNumber: 'ORD-001' },
        { id: 'order-2', orderNumber: 'ORD-002' },
      ];
      const updatedUser = { ...mockUser, phone: '0901234567' };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);
      orderRepository.findGuestOrdersByPhone.mockResolvedValue(
        guestOrders as any,
      );
      orderRepository.assignOrdersToUser.mockResolvedValue(2);

      await service.verifyLinkOtp('user-123', verifyDto);

      expect(orderRepository.findGuestOrdersByPhone).toHaveBeenCalledWith(
        '0901234567',
      );
      expect(orderRepository.assignOrdersToUser).toHaveBeenCalledWith(
        ['order-1', 'order-2'],
        'user-123',
        'cdp-123',
      );
    });

    it('should not throw error if guest order merge fails', async () => {
      const updatedUser = { ...mockUser, phone: '0901234567' };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);
      orderRepository.findGuestOrdersByPhone.mockRejectedValue(
        new Error('Database error'),
      );

      // Should not throw
      const result = await service.verifyLinkOtp('user-123', verifyDto);

      expect(result).toEqual(updatedUser);
    });

    it('should skip guest order merge if no guest orders found', async () => {
      const updatedUser = { ...mockUser, phone: '0901234567' };

      usersService.findById.mockResolvedValueOnce(mockUser);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);
      orderRepository.findGuestOrdersByPhone.mockResolvedValue([]);

      await service.verifyLinkOtp('user-123', verifyDto);

      expect(orderRepository.assignOrdersToUser).not.toHaveBeenCalled();
    });

    it('should handle user without cdpCustomerId when merging orders', async () => {
      const userNoCdp = { ...mockUser, cdpCustomerId: null };
      const guestOrders = [{ id: 'order-1', orderNumber: 'ORD-001' }];
      const updatedUser = { ...userNoCdp, phone: '0901234567' };

      usersService.findById.mockResolvedValueOnce(userNoCdp);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.update.mockResolvedValue(updatedUser);
      usersService.findById.mockResolvedValueOnce(updatedUser);
      orderRepository.findGuestOrdersByPhone.mockResolvedValue(
        guestOrders as any,
      );
      orderRepository.assignOrdersToUser.mockResolvedValue(1);

      await service.verifyLinkOtp('user-123', verifyDto);

      expect(orderRepository.assignOrdersToUser).toHaveBeenCalledWith(
        ['order-1'],
        'user-123',
        undefined,
      );
    });
  });
});
