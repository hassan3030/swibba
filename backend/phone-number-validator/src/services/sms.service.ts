// import { Vonage } from '@vonage/server-sdk';
// import axios from 'axios';
import { SMSProvider } from '../types.js';

// Mock Vonage implementation until packages are installed
export class VonageSMSProvider implements SMSProvider {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly senderName: string;

  constructor(apiKey: string, apiSecret: string, senderName: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.senderName = senderName;
  }

  async sendOTP(phoneNumber: string, otp: string, expiryMinutes: number): Promise<void> {
    try {
      // For now, just log the OTP - replace with actual Vonage implementation later
      console.log(`[VONAGE] Sending OTP ${otp} to ${phoneNumber} (valid for ${expiryMinutes} minutes)`);
      
      // TODO: Implement actual Vonage SMS sending
      // const vonage = new Vonage({ apiKey: this.apiKey, apiSecret: this.apiSecret });
      // await vonage.sms.send({
      //   to: phoneNumber,
      //   from: this.senderName,
      //   text: `${otp} is your verification code for ${this.senderName}. Valid for ${expiryMinutes} minutes.`,
      // });
    } catch (error) {
      throw new Error(`Failed to send SMS via Vonage: ${error}`);
    }
  }
}

export class BeonSMSProvider implements SMSProvider {
  private readonly token: string;
  private readonly senderName: string;

  constructor(token: string, senderName: string) {
    this.token = token;
    this.senderName = senderName;
  }

  async sendOTP(phoneNumber: string, otp: string, expiryMinutes: number): Promise<void> {
    try {
      // For now, just log the OTP - replace with actual BeOn implementation later
      console.log(`[BEON] Sending OTP ${otp} to ${phoneNumber} (valid for ${expiryMinutes} minutes)`);
      
      // TODO: Implement actual BeOn SMS sending
      // const response = await axios.post('https://v3.api.beon.chat/api/v3/messages/otp', {
      //   name: this.senderName,
      //   phoneNumber,
      //   lang: 'en',
      //   type: 'sms',
      //   custom_code: otp
      // }, {
      //   headers: {
      //     'beon-token': this.token,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // if (response.data.status !== 200) {
      //   throw new Error('Failed to send OTP via BeOn');
      // }
    } catch (error) {
      throw new Error(`Failed to send SMS via BeOn: ${error}`);
    }
  }
}

export class SMSServiceFactory {
  static createVonageProvider(apiKey: string, apiSecret: string, senderName: string): VonageSMSProvider {
    return new VonageSMSProvider(apiKey, apiSecret, senderName);
  }

  static createBeonProvider(token: string, senderName: string): BeonSMSProvider {
    return new BeonSMSProvider(token, senderName);
  }
}