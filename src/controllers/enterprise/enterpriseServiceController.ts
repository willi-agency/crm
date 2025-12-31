// src/controllers/enterprise/enterpriseServiceController.ts
import { Request, Response } from 'express';
import * as EnterpriseServiceService from '../../services/enterprise/enterpriseServiceService';
import {
  createServiceSchema,
  updateServiceSchema,
  getServiceByIdSchema,
  getAllServicesSchema,
  CreateServiceDTO,
  UpdateServiceDTO,
} from '../../schemas/enterprise/enterpriseServiceSchemas';
import { ScopeType } from '../../types/scopeType';
import { paginationSchema } from '../../schemas/paginationSchema.ts';

// =============== CREATE ===============
export const createService = async (req: Request, res: Response): Promise<Response> => {
  const validatedData: CreateServiceDTO = createServiceSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const service = await EnterpriseServiceService.createService(validatedData, scope);
  return res.status(201).json(service);
};

// =============== GET BY ID ===============
export const getServiceById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getServiceByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const service = await EnterpriseServiceService.getServiceById(scope, id);
  return res.status(200).json(service);
};

// =============== GET ALL ===============
export const getAllServices = async (req: Request, res: Response): Promise<Response> => {
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const filter = getAllServicesSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const services = await EnterpriseServiceService.getAllServices(scope, filter, pagination);
  return res.status(200).json(services);
};

// =============== UPDATE ===============
export const updateService = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getServiceByIdSchema.parse(req.params);
  const validatedData: UpdateServiceDTO = updateServiceSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const updatedService = await EnterpriseServiceService.updateService(id, validatedData, scope);
  return res.status(200).json(updatedService);
};

// =============== DELETE ===============
export const deleteService = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getServiceByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const deletedService = await EnterpriseServiceService.deleteService(id, scope);
  return res.status(200).json(deletedService);
};
