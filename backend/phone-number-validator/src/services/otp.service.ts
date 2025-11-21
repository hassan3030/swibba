import { createHash } from 'node:crypto';
import { OTPService } from '../types.js';

export class OTPServiceImpl implements OTPService {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  generateOTP(): string {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  hashOTP(otp: string): string {
    return createHash('sha256')
      .update(otp + this.secret)
      .digest('hex');
  }

  validateOTP(otp: string, hash: string): boolean {
    const expectedHash = this.hashOTP(otp);
    return expectedHash === hash;
  }
}