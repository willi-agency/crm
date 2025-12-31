/* src/controllers/blogEnterpriseController.ts */
import { Request, Response } from 'express';
import * as EnterpriseService from '../services/enterpriseService';
import { ZodError } from 'zod';
import {
  createEnterpriseSchema,
  EnterpriseCreateDTO,
  EnterpriseUpdateDTO,
  getAllEnterpriseByCnpjSchema,
  getEnterpriseAllDataByIdSchema,
  getEnterpriseByIdSchema,
  updateEnterpriseSchema,
} from '../schemas/enterpriseSchemas';
import { ScopeType } from '../types/scopeType';
import { reqApiKey } from '../schemas/reqApiKeyPublicRoute';

export const createEnterprise = async (
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
    const validatedData: EnterpriseCreateDTO = createEnterpriseSchema.parse(req.body);

    // Chama o serviço para criar a empresa no banco de dados
    const result = await EnterpriseService.createEnterprise(
      validatedData,
      scope,
    );

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

export const getEnterpriseByCnpj = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação do slug
    const validatedData = getAllEnterpriseByCnpjSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para buscar a empresa
    const enterprise = await EnterpriseService.getEnterpriseByCnpj(
      validatedData.cnpj,
      scope
    );
    return res.status(200).json(enterprise);
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

export const getAllEnterprises = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const enterprises = await EnterpriseService.getAllEnterprises(scope);
    return res.status(200).json(enterprises);
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

export const getEnterpriseAllDataById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação do slug
    const validatedData = getEnterpriseAllDataByIdSchema.parse({
      id: req.params.id,
      params: req.query.params,
    });
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para buscar a empresa
    const enterprise = await EnterpriseService.getEnterpriseAllDataById(
      validatedData.id,
      validatedData.params,
      scope
    );
    return res.status(200).json(enterprise);
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

export const updateEnterprise = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getEnterpriseByIdSchema.parse(req.params);
    const validatedData: EnterpriseUpdateDTO = updateEnterpriseSchema.parse(req.body);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const updatedEnterprise = await EnterpriseService.updateEnterprise(
      id,
      scope,
      validatedData
    );
    return res.status(200).json(updatedEnterprise);
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

export const deleteEnterprise = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getEnterpriseByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const softDeleteEnterprise = await EnterpriseService.deleteEnterprise(
      id,
      scope
    );

    return res.status(200).json({
      message: 'Empresa deletada lógicamente com sucesso!',
      enterprise: softDeleteEnterprise,
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

export const getEnterpriseByApiKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const validadeApiKey = reqApiKey.parse(req.params);
    
    const keywordPages =
      await EnterpriseService.getEnterpriseByApiKey(validadeApiKey.apiKey);
    return res.status(200).json(keywordPages);

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

