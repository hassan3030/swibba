import { Request } from 'express';

export interface DirectusRequest extends Request {
  accountability?: {
    user?: string;
    role?: string;
    admin?: boolean;
    app?: boolean;
    ip?: string;
    userAgent?: string;
    origin?: string;
  };
}