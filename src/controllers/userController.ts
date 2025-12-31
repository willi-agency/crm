// src/controllers/userController.ts
import { Request, Response } from 'express';
import * as UserService from '../services/userService';
import { ZodError } from 'zod';
import {
  CreateUserDTO,
  createUserSchema,
  getUserByEmailSchema,
  getUserByIdSchema,
  UpdateUserDTO,
  updateUserSchema,
} from '../schemas/userSchemas';
import { ScopeType } from '../types/scopeType';

export const createUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Validação dos dados de entrada com Zod
    const validatedData: CreateUserDTO = createUserSchema.parse(req.body);

    // Criar o usuário no banco de dados
    const result = await UserService.createUser(validatedData, scope);

    return res.status(201).json(result);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getUserByEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação do email
    const validatedEmail = getUserByEmailSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const result = await UserService.getUserByEmail(
      validatedEmail.email,
      scope
    );
    return res.status(201).json(result);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação do ID
    const validatedId = getUserByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const result = await UserService.getUserById(validatedId.id, scope);
    return res.status(201).json(result);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const users = await UserService.getAllUsers(scope);
    return res.status(200).json(users);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getUserByIdSchema.parse(req.params);
    // Validação dos dados de entrada com Zod
    const validatedData: UpdateUserDTO = updateUserSchema.parse(req.body);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const updatedUser = await UserService.updateUser(id, validatedData, scope);
    return res.status(200).json(updatedUser);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getUserByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const softDeleteUser = await UserService.deleteUser(id, scope);

    return res.status(200).json({
      message: 'Cliente deletado lógicamente com sucesso!',
      tag: softDeleteUser,
    });
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};
