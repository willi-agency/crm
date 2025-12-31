import { Request, Response } from 'express';
import * as BlogArticleService from '../../services/blog/blogArticleService';
import {
  createArticleSchema,
  getAllArticlesSchema,
  getArticleByIdSchema,
  getArticleBySlugSchema,
  getHomeQuerySchema,
  getPublicsArticlesSchema,
  UpdateArticleDTO,
  updateArticleSchema,
} from '../../schemas/blog/blogArticleSchemas';
import { ScopeType } from '../../types/scopeType';
import { reqApiKey } from '../../schemas/reqApiKeyPublicRoute';
import { paginationSchema } from '../../schemas/paginationSchema.ts';

export const createArticle = async (req: Request, res: Response): Promise<Response> => {
  const parsed = createArticleSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope:ScopeType = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };
  const article = await BlogArticleService.createBlogArticle(parsed, scope);
  return res.status(201).json(article);
};

export const getArticleBySlug = async (req: Request, res: Response): Promise<Response> => {
  const data = getArticleBySlugSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const article = await BlogArticleService.getBlogArticleBySlug(scope, data);
  return res.status(200).json(article);
};

export const getArticleById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getArticleByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const article = await BlogArticleService.getBlogArticleById(id, scope);
  return res.status(200).json(article);
};

export const getArticleCreationDataById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getArticleByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const article = await BlogArticleService.getArticleCreationData(id, scope);
  return res.status(200).json(article);
};

export const getAllArticles = async (req: Request, res: Response): Promise<Response> => {
  const filter = getAllArticlesSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const articles = await BlogArticleService.getAllBlogArticles(scope, filter, pagination);
  return res.status(200).json(articles);
};

export const getAllPublicArticlesByApiKey = async (req: Request, res: Response): Promise<Response> => {
  const filter = getPublicsArticlesSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const { apiKey } = reqApiKey.parse(req.params);
  const articles = await BlogArticleService.getAllPublicBlogArticlesByApiKey(apiKey, filter, pagination);
  return res.status(200).json(articles);
};

export const getPublicBlogHomeByApiKey = async (req: Request, res: Response): Promise<Response> => {
  const options = getHomeQuerySchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  const { apiKey } = reqApiKey.parse(req.params);
  const articles = await BlogArticleService.getPublicBlogHomeByApiKey(apiKey, options, pagination);
  return res.status(200).json(articles);
};

export const getPublicArticleByApiKey = async (req: Request, res: Response): Promise<Response> => {
  const { apiKey } = reqApiKey.parse(req.params);
  const { slug } = getArticleBySlugSchema.parse(req.params);
  const article = await BlogArticleService.getPublicBlogArticleByApiKey(apiKey, slug);
  return res.status(200).json(article);
};

export const updateArticle = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getArticleByIdSchema.parse(req.params);
  const validatedData: UpdateArticleDTO = updateArticleSchema.parse(req.body);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const updatedArticle = await BlogArticleService.updateBlogArticle(id, validatedData, scope);
  return res.status(200).json(updatedArticle);
};

export const deleteArticle = async (req: Request, res: Response): Promise<Response> => {
  const { id } = getArticleByIdSchema.parse(req.params);
  const user = (req as any).user as ScopeType;
  const scope = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType };
  const deletedArticle = await BlogArticleService.deleteBlogArticle(id, scope);
  return res.status(200).json(deletedArticle);
};
