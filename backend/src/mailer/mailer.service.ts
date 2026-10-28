import { Injectable } from '@nestjs/common';
import fs from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { AllConfigType } from '../config/config.type';
import { env } from '../utils/env';

@Injectable()
export class MailerService {
  private static readonly DEFAULT_EMAIL = 'dev.cchat@gmail.com';
  private static readonly DEFAULT_NAME = 'CChat E-Commerce';

  private readonly transporter: nodemailer.Transporter;
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const isDevelopment = env.NODE_ENV === 'development';

    const mailHost = configService.get('mail.host', { infer: true });
    const mailPort = configService.get('mail.port', { infer: true });
    const mailUser = configService.get('mail.user', { infer: true });
    const mailPassword = configService.get('mail.password', { infer: true });

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      ignoreTLS: false,
      secure: false,
      requireTLS: !isDevelopment,
      auth: {
        user: mailUser,
        pass: mailPassword,
      },
    });
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;
    if (templatePath) {
      const template = await fs.readFile(templatePath, 'utf-8');
      html = Handlebars.compile(template, {
        strict: true,
      })(context);
    }

    await this.transporter.sendMail({
      ...mailOptions,
      from: mailOptions.from
        ? mailOptions.from
        : `"${MailerService.DEFAULT_NAME}" <${MailerService.DEFAULT_EMAIL}>`,
      html: mailOptions.html ? mailOptions.html : html,
    });
  }
}
