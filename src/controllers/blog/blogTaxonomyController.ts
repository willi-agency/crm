// src/controllers/blog/taxonomyController.ts
import { Request, Response } from 'express';
import * as TaxonomyService from '../../services/blog/blogTaxonomyService';
import {
  createTaxonomySchema,
  updateTaxonomySchema,
  getTaxonomyByIdSchema,
  getAllTaxonomiesSchema,
  CreateTaxonomyDTO,
  UpdateTaxonomyDTO,
} from '../../schemas/blog/taxonomySchemas';
import { ScopeType } from '../../types/scopeType';
import { paginationSchema } from '../../schemas/paginationSchema.ts';

// CREATE
export const createTaxonomy = async (req: Request, res: Response): Promise<Response> => {
  const validatedData: CreateTaxonomyDTO = createTaxonomySchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const taxonomy = await TaxonomyService.createTaxonomy(validatedData, scope);
  return res.status(201).json(taxonomy);
};

// GET ALL
export const getAllTaxonomies = async (req: Request, res: Response): Promise<Response> => {
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const filter = getAllTaxonomiesSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const taxonomies = await TaxonomyService.getAllTaxonomies(scope, filter, pagination);
  return res.status(200).json(taxonomies);
};

// GET BY ID
export const getTaxonomyById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getTaxonomyByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };

  const taxonomy = await TaxonomyService.getTaxonomyById(scope, { id });
  return res.status(200).json(taxonomy);
};

// UPDATE
export const updateTaxonomy = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getTaxonomyByIdSchema.parse(req.params);
  const validatedData: UpdateTaxonomyDTO = updateTaxonomySchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const updatedTaxonomy = await TaxonomyService.updateTaxonomy(id, validatedData, scope);
  return res.status(200).json(updatedTaxonomy);
};

// DELETE
export const deleteTaxonomy = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getTaxonomyByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const deletedTaxonomy = await TaxonomyService.deleteTaxonomy(id, scope);
  return res.status(200).json(deletedTaxonomy);
};
