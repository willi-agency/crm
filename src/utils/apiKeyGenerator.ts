import { randomBytes } from 'crypto';

export const generateRandomApiKey = (length: number = 64): string => {
  const raw = randomBytes(length).toString('base64url');
  return `QSMI-${raw.slice(0, length)}`;
};
