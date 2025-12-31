import { Request, Response } from 'express';
import * as MapCoverageService from '../services/mapCoverageService';
import { ZodError } from 'zod';
import { mapCoverageDTO } from '../schemas/mapCoverageSchemas';
import { ScopeType } from '../types/scopeType';

export const getAllCountries = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const result = await MapCoverageService.getAllCountries(scope);

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

export const getStatesByCountryId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const validatedData = mapCoverageDTO.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const result = await MapCoverageService.getStatesByCountryId(validatedData.id, scope);

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

export const getCitiesByStateId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const validatedData = mapCoverageDTO.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const result = await MapCoverageService.getCitiesByStateId(validatedData.id, scope);

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

export const getDistrictsByCityId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const validatedData = mapCoverageDTO.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const result = await MapCoverageService.getDistrictsByCityId(validatedData.id, scope);

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

export const getFullTreeByDistrictId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const validatedData = mapCoverageDTO.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const result = await MapCoverageService.getFullTreeByDistrictId(validatedData.id, scope);

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
