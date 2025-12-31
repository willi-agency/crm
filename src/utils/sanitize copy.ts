// src/utils/sanitize.ts
export function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}
