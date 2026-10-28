import { Injectable } from '@nestjs/common';
import { EsmsService } from './esms/esms.service';

@Injectable()
export class SmsService {
  constructor(private esmsService: EsmsService) {}

  async sendOtp(phone: string, otp: string): Promise<void> {
    return this.esmsService.sendOtp(phone, otp);
  }
}
