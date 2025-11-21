// import { phone as phoneValidator } from 'phone';
import { PhoneValidationService, ValidationResult } from '../types.js';

// Simple phone validation fallback until packages are installed
function phoneValidator(phoneNumber: string, options?: any): { isValid: boolean; phoneNumber: string; countryIso2?: string } {
  // Basic phone number validation
  const cleaned = phoneNumber.replace(/\D/g, '');
  const withPlus = phoneNumber.startsWith('+') ? phoneNumber : `+${cleaned}`;
  
  // Very basic validation - at least 10 digits
  const isValid = cleaned.length >= 10 && cleaned.length <= 15;
  
  return {
    isValid,
    phoneNumber: withPlus,
    countryIso2: withPlus.startsWith('+20') ? 'EG' : 'Unknown'
  };
}

export class PhoneValidationServiceImpl implements PhoneValidationService {
  validatePhone(phoneNumber: string, countryCode?: string): ValidationResult {
    const options = countryCode ? { country: countryCode } : { strictDetection: true };
    const result = phoneValidator(phoneNumber, options);

    if (!result.isValid) {
      throw new Error('Invalid phone number format');
    }

    return {
      isValid: result.isValid,
      formattedNumber: result.phoneNumber,
      countryIso2: result.countryIso2 || 'Unknown'
    };
  }

  selectSMSProvider(phoneNumber: string): 'vonage' | 'beon' {
    // Egyptian numbers (+20) use BeOn, all others use Vonage
    return phoneNumber.startsWith('+20') ? 'beon' : 'vonage';
  }
}