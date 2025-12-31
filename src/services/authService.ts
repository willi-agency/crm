// src/services/authService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { secret, expiresIn } from '../config/auth';
import * as User from '../models/userModel';
import { sanitizeUser } from '../utils/sanitize';

interface LoginResponse {
  token: string;
  user: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const user = await User.findUserByEmail(email);
  // Se o usuário não existir ou a senha estiver errada
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Email ou senha inválidos!');
  }

  const lastActivity = new Date().toISOString();

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role.name,
      roleId: user.role.id,
      enterpriseId: user.enterpriseId,
      enterpriseType: user.enterprise.type,
      lastActivity,
    },
    secret,
    { expiresIn }
  );

  return {
    token,
    user: sanitizeUser(user),
  };
};
