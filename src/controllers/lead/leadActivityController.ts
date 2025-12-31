// src/controllers/leadActivityController.ts
import { Request, Response } from 'express';
import * as LeadActivityService from '../../services/lead/leadActivityService';
import {
  createLeadActivitySchema,
  updateLeadActivitySchema,
  getLeadActivityByIdSchema,
  getAllLeadActivitiesSchema,
  getLeadActivitiesByLeadIdSchema,
  getLeadPendingActivitiesByEnterpriseIdSchema,
  LeadActivityCreateDTO,
  LeadActivityUpdateDTO,
} from '../../schemas/lead/leadActivitySchemas';
import { ScopeType } from '../../types/scopeType';
import { paginationSchema } from '../../schemas/paginationSchema.ts';

// CREATE
export const createLeadActivity = async (req: Request, res: Response): Promise<Response> => {
  const validatedData: LeadActivityCreateDTO = createLeadActivitySchema.parse(req.body);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };
  const activity = await LeadActivityService.createLeadActivity(validatedData, scope);
  return res.status(201).json(activity);
};

// GET ALL
export const getAllLeadActivities = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const filter = getAllLeadActivitiesSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const activities = await LeadActivityService.getAllLeadActivities(scope, filter, pagination);
  return res.status(200).json(activities);
};

// GET BY ID
export const getLeadActivityById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getLeadActivityByIdSchema.parse(req.params);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const activity = await LeadActivityService.getLeadActivityById(id, scope);
  return res.status(200).json(activity);
};

// GET BY LEAD ID
export const getLeadActivitiesByLeadId = async (req: Request, res: Response): Promise<Response> => {
  const { leadId } = getLeadActivitiesByLeadIdSchema.parse(req.params);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const activities = await LeadActivityService.getLeadActivitiesByLeadId(leadId, scope);
  return res.status(200).json(activities);
};

// GET PENDING BY ENTERPRISE
export const getLeadPendingActivitiesByEnterpriseId = async (req: Request, res: Response): Promise<Response> => {
  const { enterpriseId } = getLeadPendingActivitiesByEnterpriseIdSchema.parse(req.params);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };
  const activities = await LeadActivityService.getLeadPendingActivitiesByEnterpriseId(enterpriseId, scope);
  return res.status(200).json(activities);
};

// UPDATE
export const updateLeadActivity = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getLeadActivityByIdSchema.parse(req.params);
  const validatedData: LeadActivityUpdateDTO = updateLeadActivitySchema.parse(req.body);
  const user = req.user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const updatedActivity = await LeadActivityService.updateLeadActivity(id, validatedData, scope);
  return res.status(200).json(updatedActivity);
};
