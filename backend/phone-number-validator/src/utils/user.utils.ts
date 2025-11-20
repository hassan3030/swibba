import { Knex } from 'knex';
import { DirectusUser } from '../types.js';
import { createError } from './errors.js';

export async function getCurrentUser(knex: Knex, accountability: any): Promise<DirectusUser> {
  if (!accountability?.user) {
    throw createError('UNAUTHORIZED');
  }

  const user = await knex('directus_users')
    .select('id', 'phone_number', 'country_code', 'otp_hash', 'expires_at', 'attempts', 'verified_phone', 'created_at')
    .where('id', accountability.user)
    .first();

  if (!user) {
    throw createError('USER_NOT_FOUND');
  }

  return user;
}

export async function isPhoneNumberTaken(knex: Knex, phoneNumber: string, excludeUserId?: string): Promise<boolean> {
  let query = knex('directus_users')
    .where('phone_number', phoneNumber)
    .where('verified_phone', true);

  if (excludeUserId) {
    query = query.whereNot('id', excludeUserId);
  }

  const existing = await query.first();
  return !!existing;
}

export async function updateUserVerification(
  knex: Knex,
  userId: string,
  otpHash: string,
  expiresAt: Date,
  phoneNumber?: string,
  countryCode?: string
): Promise<void> {
  const updateData: any = {
    otp_hash: otpHash,
    expires_at: expiresAt,
    attempts: 0,
    created_at: new Date()
  };

  // If phone_number and country_code are provided, save them
  // This allows verification to work even if profile isn't fully saved yet
  if (phoneNumber !== undefined) {
    updateData.phone_number = phoneNumber;
  }
  if (countryCode !== undefined) {
    updateData.country_code = countryCode;
  }

  await knex('directus_users')
    .where('id', userId)
    .update(updateData);
}

export async function verifyUserPhone(knex: Knex, userId: string): Promise<void> {
  // Only update the verified_phone flag, don't change phone_number or country_code
  await knex('directus_users')
    .where('id', userId)
    .update({
      verified_phone: true,
      otp_hash: null,
      expires_at: null,
      attempts: 0
    });
}

export async function incrementAttempts(knex: Knex, userId: string): Promise<number> {
  const user = await knex('directus_users')
    .where('id', userId)
    .first();

  const newAttempts = (user.attempts || 0) + 1;

  await knex('directus_users')
    .where('id', userId)
    .update({ attempts: newAttempts });

  return newAttempts;
}

export async function clearExpiredOTPs(knex: Knex): Promise<void> {
  await knex('directus_users')
    .where('expires_at', '<', new Date())
    .whereNotNull('expires_at')
    .update({
      otp_hash: null,
      expires_at: null,
      attempts: 0
    });
}