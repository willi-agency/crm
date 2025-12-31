// src/controllers/campaign/utmSubmissionController.ts
import { Request, Response } from 'express';
import * as UtmSubmissionService from '../../services/campaign/utmSubmissionService';
import {
  createUtmSubmissionSchema,
  getAllUtmSubmissionsSchema,
  getUtmSubmissionByIdSchema,
  checkSimilaritySchema,
} from '../../schemas/campaign/utmSubmissionSchemas';
import { ScopeType } from '../../types/scopeType';
import { paginationSchema } from '../../schemas/paginationSchema.ts';

export const createUtmSubmission = async (req: Request, res: Response): Promise<Response> => {
  const validatedData = createUtmSubmissionSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope: ScopeType = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };
  const submission = await UtmSubmissionService.createUtmSubmission(validatedData, scope);
  return res.status(201).json(submission);
};

export const getUtmSubmissionById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getUtmSubmissionByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope: ScopeType = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };
  const submission = await UtmSubmissionService.getUtmSubmissionById(id, scope);
  return res.status(200).json(submission);
};

export const getAllUtmSubmissions = async (req: Request, res: Response): Promise<Response> => {
  const filter = getAllUtmSubmissionsSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const user = (req as any).user as ScopeType;
  const scope: ScopeType = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };
  const submissions = await UtmSubmissionService.getAllUtmSubmissions(scope, filter, pagination);
  return res.status(200).json(submissions);
};

export const checkUtmSimilarity = async (req: Request, res: Response): Promise<Response> => {
  const validatedData = checkSimilaritySchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope: ScopeType = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };

  const result = await UtmSubmissionService.checkUtmSimilarity(validatedData, scope);
  return res.status(200).json(result);
};