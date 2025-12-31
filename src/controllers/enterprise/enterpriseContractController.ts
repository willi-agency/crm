import { Request, Response } from 'express';
import * as EnterpriseContractService from '../../services/enterprise/enterpriseContractService';
import {
  createContractSchema,
  updateContractSchema,
  getContractByIdSchema,
  getContractByCodeSchema,
  getAllContractsSchema,
  CreateContractDTO,
  UpdateContractDTO,
} from '../../schemas/enterprise/enterpriseContractSchemas';
import { ScopeType } from '../../types/scopeType';
import { paginationSchema } from '../../schemas/paginationSchema.ts';

// =============== CREATE ===============
export const createContract = async (req: Request, res: Response): Promise<Response> => {
  const validatedData: CreateContractDTO = createContractSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const contract = await EnterpriseContractService.createContract(validatedData, scope);
  return res.status(201).json(contract);
};

// =============== GET BY CODE ===============
export const getContractByCode = async (req: Request, res: Response): Promise<Response> => {
  const { code } = getContractByCodeSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const contract = await EnterpriseContractService.getContractByCode(scope, code);
  return res.status(200).json(contract);
};

// =============== GET ALL ===============
export const getAllContracts = async (req: Request, res: Response): Promise<Response> => {
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const filter = getAllContractsSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const contracts = await EnterpriseContractService.getAllContracts(scope, filter, pagination);
  return res.status(200).json(contracts);
};

// =============== UPDATE ===============
export const updateContract = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getContractByIdSchema.parse(req.params);
  const validatedData: UpdateContractDTO = updateContractSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const updatedContract = await EnterpriseContractService.updateContract(id, validatedData, scope);
  return res.status(200).json(updatedContract);
};

// =============== DELETE ===============
export const deleteContract = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getContractByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const deletedContract = await EnterpriseContractService.deleteContract(id, scope);
  return res.status(200).json(deletedContract);
};
