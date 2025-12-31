import { Request, Response } from 'express';
import * as BlogArticleService from '../services/blogArticleService';
import { ZodError } from 'zod';
import {
  CreateArticleDTO,
  createArticleSchema,
  getArticleBySlugSchema,
  getArticleByIdSchema,
  updateArticleSchema,
  UpdateArticleDTO,
} from '../schemas/blogArticleSchemas';
import { ScopeType } from '../types/scopeType';
import { reqApiKey } from '../schemas/reqApiKeyPublicRoute';

type ScopeTypeArticle = ScopeType & { id: string };

export const createArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeTypeArticle;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
      userId: user?.id,
    };

    // Validação dos dados de entrada com Zod
    const validatedData: CreateArticleDTO = createArticleSchema.parse(req.body);

    // Chama o serviço para criar a categoria no banco de dados
    const result = await BlogArticleService.createArticle(validatedData, scope);

    // Retorna a resposta de sucesso
    return res.status(201).json(result);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getArticleBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação dos dados
    const validatedData = getArticleBySlugSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para buscar a categoria
    const article = await BlogArticleService.getArticleByName(
      validatedData.slug,
      scope
    );
    return res.status(200).json(article);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getArticleById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getArticleByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const article = await BlogArticleService.getArticleById(id, scope);

    return res.status(200).json(article);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getArticleCreationDataById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getArticleByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const article = await BlogArticleService.getArticleCreationData(id, scope);

    return res.status(200).json(article);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getAllArticles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const tags = await BlogArticleService.getAllArticles(scope);
    return res.status(200).json(tags);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getAllPublicArticlesByApiKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { apiKey } = reqApiKey.parse(req.params);

    const keywordPages =
      await BlogArticleService.getAllPublicArticlesByApiKey(apiKey);
    return res.status(200).json(keywordPages);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getPublicArticleByApiKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { apiKey } = reqApiKey.parse(req.params);
    const { slug } = getArticleBySlugSchema.parse(req.params);

    const keywordPages = await BlogArticleService.getPublicArticleByApiKey(
      apiKey,
      slug
    );
    return res.status(200).json(keywordPages);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const updateArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getArticleByIdSchema.parse(req.params);
    // Validação dos dados de entrada com Zod
    const validatedData: UpdateArticleDTO = updateArticleSchema.parse(req.body);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };


    const updatedArticle = await BlogArticleService.updateArticle(
      id,
      validatedData,
      scope
    );
    return res.status(200).json(updatedArticle);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const deleteArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getArticleByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const softDeleteArticle = await BlogArticleService.deleteArticle(id, scope);

    return res.status(200).json({
      message: 'Autor deletado lógicamente com sucesso!',
      tag: softDeleteArticle,
    });
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};
