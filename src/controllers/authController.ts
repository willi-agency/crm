// src/controllers/authController.ts

import { Request, Response } from 'express';
import * as AuthService from '../services/authService';
import { loginSchema } from '../schemas/authSchemas';
import { cookieOptions } from '../config/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  const validatedData = loginSchema.parse(req.body);

  try {
    const { token, user } = await AuthService.login(
      validatedData.email,
      validatedData.password
    );

    // Setar o cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // só HTTPS em produção
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    res.status(200).json({
      message: 'Login realizado com sucesso!',
      user, // Retorna só os dados do usuário, NÃO o token
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(400)
        .json({ message: err.message || 'Erro ao realizar login' });
    } else {
      res.status(500).json({ message: 'Erro desconhecido no servidor' });
    }
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logout realizado com sucesso!' });
};
