// src/schemas/userSchemas.ts
import { z } from 'zod';

// Validação para criar usuário
export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha precisa ter no mínimo 6 caracteres'),
  roleId: z.string().uuid('ID do papel inválido'),
  enterpriseId: z.string().min(3, 'Nome da empresa é inválido'),
});
export type CreateUserDTO = z.infer<typeof createUserSchema>;

// Validação para criar usuário
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha precisa ter no mínimo 6 caracteres').optional(),
  roleId: z.string().uuid('ID do papel inválido').optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// Validação para buscar usuário por email
export const getUserByEmailSchema = z.object({
  email: z.string().email('Email inválido'), // Validação de email
});

// Validação para buscar usuário por ID
export const getUserByIdSchema = z.object({
  id: z.string().uuid('ID inválido'), // ID do usuário no formato UUID
});
