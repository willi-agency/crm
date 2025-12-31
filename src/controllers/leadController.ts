import { Request, Response } from 'express';
import * as LeadService from '../services/leadService';
import {
  CreateLeadDTO,
  createLeadSchema,
  getByPipelineSchema
} from '../schemas/leadSchemas';
import { ScopeType } from '../types/scopeType';
import { getEnterpriseByIdSchema } from '../schemas/enterpriseSchemas';
import { paginationSchema } from '../schemas/paginationSchema.ts';
import { getAllLeadsSchema, LeadSubmitCreateSchema, LeadSubmitInternalCreateDTO } from '../schemas/lead/leadSchemas';

// CREATE LEAD
export const createLead = async (req: Request, res: Response): Promise<Response> => {
  const validatedData: CreateLeadDTO = createLeadSchema.parse(req.body);
  const user = req.user as ScopeType;
  const result = await LeadService.createLeadSubmitAndLeadData(validatedData);
  return res.status(201).json(result);
};

export const createInternalLead = async (req: Request, res: Response): Promise<Response> => {
  const validatedData = LeadSubmitCreateSchema.parse(req.body);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const result = await LeadService.createLeadSubmit(scope, validatedData);
  return res.status(201).json(result);
};

// GET ALL LEADS
export const getAllLeads = async (req: Request, res: Response): Promise<Response> => {
  const filter = getAllLeadsSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const leads = await LeadService.getAllLeads(scope, filter, pagination);
  return res.status(200).json(leads);
};

// GET LEAD BY ID
export const getLeadById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getEnterpriseByIdSchema.parse(req.params);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const lead = await LeadService.getLeadById(id, scope);
  return res.status(200).json(lead);
};

// GET ALL LEADS BY ENTERPRISE
export const getAllLeadsByEnterpriseId = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getEnterpriseByIdSchema.parse(req.params);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const leads = await LeadService.getLeadsByEnterprise(id, scope);
  return res.status(200).json(leads);
};

// GET LEADS FOR KANBAN
export const getAllLeadsKanban = async (req: Request, res: Response): Promise<Response> => {
  const { enterpriseId, pipelineId } = getByPipelineSchema.parse(req.params);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const stageId = (req.query.stageId as string) || undefined;

  const leads = await LeadService.getLeadsForKanban(
    enterpriseId,
    pipelineId,
    scope,
    stageId,
    page,
    limit
  );

  return res.status(200).json(leads);
};
