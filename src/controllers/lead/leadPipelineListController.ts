// src/controllers/leadPipelineListController.ts
import { Request, Response } from 'express';
import * as LeadPipelineListService from '../../services/lead/leadPipelineListService';
import { ZodError } from 'zod';
import {
  createLeadPipelineListSchema,
} from '../../schemas/lead/leadPipelineListSchemas';
import { ScopeType } from '../../types/scopeType';

export const createLeadPipelineListController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
      id: user?.id,
    };

    // validação Zod
    const validatedData = createLeadPipelineListSchema.parse(req.body);

    // adiciona userId vindo do token
    const result = await LeadPipelineListService.createLeadPipelineList(
      validatedData,
      scope
    );

    return res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

