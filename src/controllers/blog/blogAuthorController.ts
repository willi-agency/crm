import { Request, Response } from 'express';
import * as BlogAuthorService from '../../services/blog/blogAuthorService';
import {
  createAuthorSchema,
  updateAuthorSchema,
  getAuthorByIdSchema,
  getAuthorByNameSchema,
  CreateBlogAuthorDTO,
  UpdateBlogAuthorDTO,
  getAllAuthorsSchema,
} from '../../schemas/blog/blogAuthorSchemas';
import { ScopeType } from '../../types/scopeType';
import { paginationSchema } from '../../schemas/paginationSchema.ts';

// CREATE
export const createAuthor = async (req: Request, res: Response): Promise<Response> => {
  const validatedData: CreateBlogAuthorDTO = createAuthorSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const author = await BlogAuthorService.createAuthor(validatedData, scope);
  return res.status(201).json(author);
};

// GET BY NAME
export const getAuthorByName = async (req: Request, res: Response): Promise<Response> => {
  const data = getAuthorByNameSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const author = await BlogAuthorService.getAuthorByName(scope, data);
  return res.status(200).json(author);
};

// GET ALL
export const getAllAuthors = async (req: Request, res: Response): Promise<Response> => {
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const filter = getAllAuthorsSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const authors = await BlogAuthorService.getAllAuthors(scope, filter, pagination);
  return res.status(200).json(authors);
};

// UPDATE
export const updateAuthor = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getAuthorByIdSchema.parse(req.params);
  const validatedData: UpdateBlogAuthorDTO = updateAuthorSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const updatedAuthor = await BlogAuthorService.updateAuthor(id, validatedData, scope);
  return res.status(200).json(updatedAuthor);
};

// DELETE
export const deleteAuthor = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getAuthorByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const deletedAuthor = await BlogAuthorService.deleteAuthor(id, scope);
  return res.status(200).json(deletedAuthor);
};
