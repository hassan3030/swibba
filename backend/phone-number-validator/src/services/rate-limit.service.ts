import { Knex } from 'knex';
// import ms from 'ms';
import { RateLimitService } from '../types.js';

// Simple time conversion
function ms(timeString: string): number {
  if (timeString === '1h') return 60 * 60 * 1000;
  if (timeString === '1m') return 60 * 1000;
  return 0;
}

export class RateLimitServiceImpl implements RateLimitService {
  private readonly knex: Knex;
  private readonly maxRequestsPerHour: number;
  private readonly resendCooldownMinutes: number;

  constructor(knex: Knex, maxRequestsPerHour = 3, resendCooldownMinutes = 1) {
    this.knex = knex;
    this.maxRequestsPerHour = maxRequestsPerHour;
    this.resendCooldownMinutes = resendCooldownMinutes;
  }

  async checkRateLimit(userId: string, phoneNumber: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - ms('1h'));
    
    const recentAttempts = await this.knex('directus_users')
      .where('id', userId)
      .where('phone_number', phoneNumber)
      .where('created_at', '>=', oneHourAgo)
      .count('id as count')
      .first();

    if (recentAttempts && Number(recentAttempts.count) >= this.maxRequestsPerHour) {
      throw new Error('Rate limit exceeded. Try again later.');
    }
  }

  async canResend(userId: string, phoneNumber: string): Promise<boolean> {
    const cooldownTime = new Date(Date.now() - ms('1m'));
    
    const recentRequest = await this.knex('directus_users')
      .where('id', userId)
      .where('phone_number', phoneNumber)
      .where('created_at', '>=', cooldownTime)
      .first();

    return !recentRequest;
  }
}