import { Request, Response } from 'express';
import * as RoleService from '../services/roleService';
import { ZodError } from 'zod';
import {
  CreateRoleSchemaDTO,
  getRoleByIdSchema,
  updateRoleSchema,
  UpdateRoleSchemaDTO,
  createRoleSchema,
  getRoleByEnterpriseIdSchema,
} from '../schemas/roleSchemas';
import { ScopeType } from '../types/scopeType';

export const createRole = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType & { id: string };
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const userId = user.id;

    // Validação dos dados de entrada com Zod
    const validatedData: CreateRoleSchemaDTO = createRoleSchema.parse(req.body);

    // Chama o serviço para criar a categoria no banco de dados
    const result = await RoleService.createRole(validatedData, scope, userId);

    // Retorna a resposta de sucesso
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

export const getAllRoles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const tags = await RoleService.getAllRoles(scope);
    return res.status(200).json(tags);
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

export const getAllRolesByEnterprise = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const { enterpriseId } = getRoleByEnterpriseIdSchema.parse(req.params);
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const tags = await RoleService.getAllRolesByEnterprise(scope, enterpriseId);
    return res.status(200).json(tags);
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

export const updateRole = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getRoleByIdSchema.parse(req.params);
    // Validação dos dados de entrada com Zod
    const validatedData: UpdateRoleSchemaDTO = updateRoleSchema.parse(req.body);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const updatedRole = await RoleService.updateRole(id, validatedData, scope);
    return res.status(200).json(updatedRole);
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

export const deleteRole = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getRoleByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const softDeleteRole = await RoleService.deleteRole(id, scope);

    return res.status(200).json({
      message: 'Role deletado lógicamente com sucesso!',
      tag: softDeleteRole,
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
