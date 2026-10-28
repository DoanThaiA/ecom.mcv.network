import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../src/mail/mail.service';
import { MailerService } from '../../src/mailer/mailer.service';
import { I18nContext } from 'nestjs-i18n';

describe('MailService', () => {
  let service: MailService;
  let mailerService: jest.Mocked<MailerService>;
  let configService: jest.Mocked<ConfigService>;

  // Mock I18nContext
  const mockI18nContext = {
    t: jest.fn((key: string) => Promise.resolve(key)),
  };

  beforeEach(async () => {
    const mockMailerService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'app.backendDomain') return 'http://localhost:3000';
        if (key === 'app.websiteDomain') return 'http://localhost:3001';
        if (key === 'app.workingDirectory') return '/app';
        return null;
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'app.websiteDomain') return 'http://localhost:3001';
        if (key === 'app.workingDirectory') return '/app';
        return 'mock-value';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get(MailerService);
    configService = module.get(ConfigService);

    // Mock I18nContext.current()
    jest.spyOn(I18nContext, 'current').mockReturnValue(mockI18nContext as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userSignUp', () => {
    it('should send user signup email with confirmation link', async () => {
      const mailData = {
        to: 'test@example.com',
        data: {
          hash: 'test-hash-123',
        },
      };

      await service.userSignUp(mailData);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'auth.confirmEmail',
          text: expect.stringContaining('test-hash-123'),
          templatePath: expect.stringContaining('activation.hbs'),
          context: expect.objectContaining({
            title: 'auth.confirmEmail',
            url: expect.stringContaining('test-hash-123'),
            base_url: 'http://localhost:3000',
          }),
        }),
      );
    });

    it('should construct correct confirmation URL with hash', async () => {
      const mailData = {
        to: 'user@example.com',
        data: {
          hash: 'abc123',
        },
      };

      await service.userSignUp(mailData);

      const callArgs = mailerService.sendMail.mock.calls[0][0];
      expect(callArgs.context.url).toContain('/auth/confirm-email');
      expect(callArgs.context.url).toContain('hash=abc123');
    });

    it('should use i18n translations when available', async () => {
      const mailData = {
        to: 'test@example.com',
        data: {
          hash: 'test-hash',
        },
      };

      await service.userSignUp(mailData);

      expect(mockI18nContext.t).toHaveBeenCalledWith('auth.confirmEmail');
      expect(mockI18nContext.t).toHaveBeenCalledWith('confirm-email.text1');
      expect(mockI18nContext.t).toHaveBeenCalledWith('confirm-email.text2');
      expect(mockI18nContext.t).toHaveBeenCalledWith('confirm-email.text3');
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email with reset link', async () => {
      const mailData = {
        to: 'user@example.com',
        data: {
          hash: 'reset-hash-456',
          tokenExpires: 1704672000000,
        },
      };

      await service.forgotPassword(mailData);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'auth.resetPassword',
          text: expect.stringContaining('reset-hash-456'),
          templatePath: expect.stringContaining('reset-password.hbs'),
          context: expect.objectContaining({
            title: 'auth.resetPassword',
            url: expect.stringContaining('reset-hash-456'),
            base_url: 'http://localhost:3000',
          }),
        }),
      );
    });

    it('should include token expiration in reset URL', async () => {
      const tokenExpires = 1704672000000;
      const mailData = {
        to: 'user@example.com',
        data: {
          hash: 'reset-hash',
          tokenExpires,
        },
      };

      await service.forgotPassword(mailData);

      const callArgs = mailerService.sendMail.mock.calls[0][0];
      expect(callArgs.context.url).toContain('/auth/password-change');
      expect(callArgs.context.url).toContain('hash=reset-hash');
      expect(callArgs.context.url).toContain(`expires=${tokenExpires}`);
    });

    it('should use i18n translations for reset password', async () => {
      const mailData = {
        to: 'test@example.com',
        data: {
          hash: 'test-hash',
          tokenExpires: 1704672000000,
        },
      };

      await service.forgotPassword(mailData);

      expect(mockI18nContext.t).toHaveBeenCalledWith('auth.resetPassword');
      expect(mockI18nContext.t).toHaveBeenCalledWith('reset-password.text1');
      expect(mockI18nContext.t).toHaveBeenCalledWith('reset-password.text2');
      expect(mockI18nContext.t).toHaveBeenCalledWith('reset-password.text3');
      expect(mockI18nContext.t).toHaveBeenCalledWith('reset-password.text4');
    });
  });

  describe('confirmNewEmail', () => {
    it('should send confirm new email with verification link', async () => {
      const mailData = {
        to: 'newemail@example.com',
        data: {
          hash: 'confirm-hash-789',
        },
      };

      await service.confirmNewEmail(mailData);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newemail@example.com',
          subject: 'auth.confirmEmail',
          text: expect.stringContaining('confirm-hash-789'),
          templatePath: expect.stringContaining('confirm-new-email.hbs'),
          context: expect.objectContaining({
            title: 'auth.confirmEmail',
            url: expect.stringContaining('confirm-hash-789'),
            base_url: 'http://localhost:3000',
          }),
        }),
      );
    });

    it('should construct correct new email confirmation URL', async () => {
      const mailData = {
        to: 'newemail@example.com',
        data: {
          hash: 'xyz789',
        },
      };

      await service.confirmNewEmail(mailData);

      const callArgs = mailerService.sendMail.mock.calls[0][0];
      expect(callArgs.context.url).toContain('/auth/confirm-new-email');
      expect(callArgs.context.url).toContain('hash=xyz789');
    });

    it('should use i18n translations for new email confirmation', async () => {
      const mailData = {
        to: 'test@example.com',
        data: {
          hash: 'test-hash',
        },
      };

      await service.confirmNewEmail(mailData);

      expect(mockI18nContext.t).toHaveBeenCalledWith('auth.confirmEmail');
      expect(mockI18nContext.t).toHaveBeenCalledWith('confirm-new-email.text1');
      expect(mockI18nContext.t).toHaveBeenCalledWith('confirm-new-email.text2');
      expect(mockI18nContext.t).toHaveBeenCalledWith('confirm-new-email.text3');
    });
  });

  describe('configuration usage', () => {
    it('should use correct config values for URLs', async () => {
      const mailData = {
        to: 'test@example.com',
        data: { hash: 'test' },
      };

      await service.userSignUp(mailData);

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'app.websiteDomain',
        {
          infer: true,
        },
      );
      expect(configService.get).toHaveBeenCalledWith('app.backendDomain', {
        infer: true,
      });
    });

    it('should use correct working directory for templates', async () => {
      const mailData = {
        to: 'test@example.com',
        data: { hash: 'test' },
      };

      await service.userSignUp(mailData);

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'app.workingDirectory',
        { infer: true },
      );

      const callArgs = mailerService.sendMail.mock.calls[0][0];
      // Normalize path separators for cross-platform compatibility
      const normalizedPath = callArgs.templatePath.replace(/\\/g, '/');
      expect(normalizedPath).toContain('/app/src/mail/mail-templates');
    });
  });
});
