// src/config/auth.ts
import dotenv from 'dotenv';
dotenv.config();

export const secret = process.env.JWT_SECRET as string;
export const expiresIn = '24h';
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
};
