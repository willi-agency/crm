// src/controllers/leadPipelineController.ts
import { Request, Response } from 'express';
import * as LeadPipelineService from '../../services/lead/leadPipelineService';
import { ZodError } from 'zod';
import {
  createLeadPipelineSchema,
  updateLeadPipelineSchema,
  getLeadPipelineByIdSchema,
  getAllLeadPipelinesSchema,
  LeadPipelineCreateDTO,
  LeadPipelineUpdateDTO,
} from '../../schemas/lead/leadPipelineSchemas';
import { ScopeType } from '../../types/scopeType';

export const createLeadPipelineController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const validatedData: LeadPipelineCreateDTO = createLeadPipelineSchema.parse(req.body);

    const result = await LeadPipelineService.createLeadPipeline(validatedData, scope);

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

export const getAllLeadPipelines = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const parsedQuery = getAllLeadPipelinesSchema.parse(req.query);
    const { name, description, enterpriseId, search, page, perPage } = parsedQuery;

    const filter = { name, description, enterpriseId, search };
    const pagination = { page, perPage };

    const pipelines = await LeadPipelineService.getAllLeadsPipelines(scope, filter, pagination);

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

export const getAllLeadPipelinesById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id: enterpriseId } = getLeadPipelineByIdSchema.parse(req.params);;
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const parsedQuery = getAllLeadPipelinesSchema.parse(req.query);
    const { name, description, search, page, perPage } = parsedQuery;

    const filter = { name, description, search };
    const pagination = { page, perPage };

    const pipelines = await LeadPipelineService.getAllLeadPipelinesByEnterprise(
      enterpriseId,
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

export const updateLeadPipeline = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getLeadPipelineByIdSchema.parse(req.params);
    const validatedBody: LeadPipelineUpdateDTO = updateLeadPipelineSchema.parse(req.body);

    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const updatedPipeline = await LeadPipelineService.updateLeadPipeline(
      id,
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
