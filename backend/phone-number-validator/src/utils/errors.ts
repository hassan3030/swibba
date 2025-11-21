import { ERROR_CODES, ErrorCode, VerificationError } from '../types.js';

export class CustomError extends Error implements VerificationError {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(errorCode: ErrorCode, customMessage?: string) {
    const errorInfo = ERROR_CODES[errorCode];
    super(customMessage || errorInfo.message);
    this.code = errorInfo.code;
    this.statusCode = errorInfo.status;
    this.name = 'VerificationError';
  }
}

export function createError(errorCode: ErrorCode, customMessage?: string): CustomError {
  return new CustomError(errorCode, customMessage);
}

export function handleError(error: unknown): { statusCode: number; message: string; code?: string } {
  if (error instanceof CustomError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message
    };
  }

  return {
    statusCode: 500,
    message: 'An unexpected error occurred'
  };
}