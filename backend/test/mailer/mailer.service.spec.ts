import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs/promises';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { MailerService } from '../../src/mailer/mailer.service';

// Mock modules
jest.mock('node:fs/promises');
jest.mock('nodemailer');
jest.mock('handlebars');
jest.mock('../../src/utils/env', () => ({
  env: { NODE_ENV: 'test' },
}));

describe('MailerService', () => {
  let service: MailerService;
  let configService: jest.Mocked<ConfigService>;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;

  beforeEach(async () => {
    // Setup mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    } as any;

    // Setup nodemailer.createTransport mock
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                'mail.host': 'smtp.test.com',
                'mail.port': 587,
                'mail.user': 'test@test.com',
                'mail.password': 'testpassword',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create nodemailer transporter with config', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        ignoreTLS: false,
        secure: false,
        requireTLS: true, // test environment is not development
        auth: {
          user: 'test@test.com',
          pass: 'testpassword',
        },
      });
    });
  });

  describe('sendMail', () => {
    it('should send email with template and context', async () => {
      const templateContent = 'Hello {{name}}!';
      const compiledTemplate = jest.fn().mockReturnValue('Hello John!');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      await service.sendMail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        templatePath: '/path/to/template.hbs',
        context: { name: 'John' },
      });

      expect(fs.readFile).toHaveBeenCalledWith(
        '/path/to/template.hbs',
        'utf-8',
      );
      expect(Handlebars.compile).toHaveBeenCalledWith(templateContent, {
        strict: true,
      });
      expect(compiledTemplate).toHaveBeenCalledWith({ name: 'John' });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@test.com',
          subject: 'Test Subject',
          from: '"CChat E-Commerce" <dev.cchat@gmail.com>',
          html: 'Hello John!',
        }),
      );
    });

    it('should use default from address when not provided', async () => {
      const templateContent = 'Test content';
      const compiledTemplate = jest.fn().mockReturnValue('Compiled content');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      await service.sendMail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        templatePath: '/path/to/template.hbs',
        context: {},
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"CChat E-Commerce" <dev.cchat@gmail.com>',
        }),
      );
    });

    it('should use custom from address when provided', async () => {
      const templateContent = 'Test content';
      const compiledTemplate = jest.fn().mockReturnValue('Compiled content');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      await service.sendMail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        from: '"Custom Sender" <custom@test.com>',
        templatePath: '/path/to/template.hbs',
        context: {},
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Custom Sender" <custom@test.com>',
        }),
      );
    });

    it('should use provided html when no template path', async () => {
      await service.sendMail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Custom HTML</p>',
        templatePath: '',
        context: {},
      });

      expect(fs.readFile).not.toHaveBeenCalled();
      expect(Handlebars.compile).not.toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<p>Custom HTML</p>',
        }),
      );
    });

    it('should handle multiple recipients', async () => {
      const templateContent = 'Test content';
      const compiledTemplate = jest.fn().mockReturnValue('Compiled content');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      await service.sendMail({
        to: ['user1@test.com', 'user2@test.com', 'user3@test.com'],
        subject: 'Test Subject',
        templatePath: '/path/to/template.hbs',
        context: {},
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@test.com', 'user2@test.com', 'user3@test.com'],
        }),
      );
    });

    it('should pass through CC and BCC fields', async () => {
      const templateContent = 'Test content';
      const compiledTemplate = jest.fn().mockReturnValue('Compiled content');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      await service.sendMail({
        to: 'recipient@test.com',
        cc: 'cc@test.com',
        bcc: 'bcc@test.com',
        subject: 'Test Subject',
        templatePath: '/path/to/template.hbs',
        context: {},
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          cc: 'cc@test.com',
          bcc: 'bcc@test.com',
        }),
      );
    });

    it('should handle template compilation with complex context', async () => {
      const templateContent =
        '{{user.name}} - {{#each items}}{{this.name}}{{/each}}';
      const compiledTemplate = jest
        .fn()
        .mockReturnValue('John - Item1Item2Item3');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      const complexContext = {
        user: { name: 'John', email: 'john@test.com' },
        items: [{ name: 'Item1' }, { name: 'Item2' }, { name: 'Item3' }],
        timestamp: new Date('2026-01-07'),
      };

      await service.sendMail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        templatePath: '/path/to/template.hbs',
        context: complexContext,
      });

      expect(compiledTemplate).toHaveBeenCalledWith(complexContext);
    });

    it('should handle template read error', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(
        service.sendMail({
          to: 'recipient@test.com',
          subject: 'Test Subject',
          templatePath: '/nonexistent/template.hbs',
          context: {},
        }),
      ).rejects.toThrow('File not found');

      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should handle sendMail error', async () => {
      const templateContent = 'Test content';
      const compiledTemplate = jest.fn().mockReturnValue('Compiled content');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);
      mockTransporter.sendMail.mockRejectedValue(
        new Error('SMTP connection failed'),
      );

      await expect(
        service.sendMail({
          to: 'recipient@test.com',
          subject: 'Test Subject',
          templatePath: '/path/to/template.hbs',
          context: {},
        }),
      ).rejects.toThrow('SMTP connection failed');
    });

    it('should send email with attachments', async () => {
      const templateContent = 'Test content';
      const compiledTemplate = jest.fn().mockReturnValue('Compiled content');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      await service.sendMail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        templatePath: '/path/to/template.hbs',
        context: {},
        attachments: [
          {
            filename: 'invoice.pdf',
            path: '/path/to/invoice.pdf',
          },
          {
            filename: 'logo.png',
            content: Buffer.from('fake-image-data'),
          },
        ],
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: [
            {
              filename: 'invoice.pdf',
              path: '/path/to/invoice.pdf',
            },
            {
              filename: 'logo.png',
              content: Buffer.from('fake-image-data'),
            },
          ],
        }),
      );
    });

    it('should use template html over provided html', async () => {
      const templateContent = 'Template content: {{message}}';
      const compiledTemplate = jest
        .fn()
        .mockReturnValue('Template content: Hello');

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

      await service.sendMail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Should be overridden</p>',
        templatePath: '/path/to/template.hbs',
        context: { message: 'Hello' },
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<p>Should be overridden</p>', // Original html is preserved when provided
        }),
      );
    });
  });
});
