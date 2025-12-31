// src/controllers/leadPipelineStageController.ts
import { Request, Response } from 'express';
import * as LeadPipelineStageService from '../../services/lead/leadPipelineStageService';
import { ZodError } from 'zod';
import {
  createLeadPipelineStageSchema,
  getAllLeadPipelineStagesSchema,
  LeadPipelineStageCreateDTO,
  getLeadPipelineStageByPipelineIdSchema,
  updateLeadPipelineStagesSchema,
} from '../../schemas/lead/leadPipelineStageSchemas';
import { ScopeType } from '../../types/scopeType';
import { LeadPipelineStagesUpdateDTO } from '../../types/lead/leadPipelineStageType';

export const createLeadPipelineStageController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const validatedData: LeadPipelineStageCreateDTO = createLeadPipelineStageSchema.parse(req.body);

    const result = await LeadPipelineStageService.createLeadPipelineStage(validatedData, scope);

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

export const getAllLeadPipelineStagesByPipelineId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { pipelineId } = getLeadPipelineStageByPipelineIdSchema.parse(req.params);;
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const parsedQuery = getAllLeadPipelineStagesSchema.parse(req.query);
    const { name, order, search, page, perPage } = parsedQuery;

    const filter = { name, order, search };
    const pagination = { page, perPage };

    const pipelines = await LeadPipelineStageService.getAllLeadsPipelinesStagesByPipelineId(
      pipelineId,
      scope,
      filter,
      pagination
    );

    return res.status(200).json(pipelines);
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

export const updateLeadPipelineStage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { pipelineId } = getLeadPipelineStageByPipelineIdSchema.parse(req.params);
    const validatedBody: LeadPipelineStagesUpdateDTO = updateLeadPipelineStagesSchema.parse(req.body);

    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const updatedPipeline = await LeadPipelineStageService.updateLeadPipelineStages(
      pipelineId,
      validatedBody,
      scope
    );

    return res.status(200).json(updatedPipeline);
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
