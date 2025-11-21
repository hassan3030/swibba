export function validateRequestBody<T>(body: any, requiredFields: (keyof T)[]): T {
  const missing = requiredFields.filter(field => !body[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return body as T;
}

export function sanitizePhoneNumber(phoneNumber: string): string {
  // Remove any whitespace and ensure it starts with +
  const cleaned = phoneNumber.trim();
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export function getExpiryMinutes(expiresAt: Date): number {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}