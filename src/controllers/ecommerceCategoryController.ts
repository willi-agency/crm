/* src/controllers/ecommerceCategoryController.ts */
import { Request, Response } from 'express';
import * as EcommerceCategoryService from '../services/ecommerceCategoryService';
import { ZodError } from 'zod';
import {
  createCategorySchema,
  getCategoryBySlugSchema,
  getCategoryByIdSchema,
  updateCategorySchema,
  CreateEcommerceCategoryDTO,
  getAllCategoriesSchema,
} from '../schemas/ecommerceCategorySchemas';
import { ScopeType } from '../types/scopeType';

export const createCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Validação dos dados de entrada com Zod
    const validatedData: CreateEcommerceCategoryDTO = createCategorySchema.parse(req.body);
    // Chama o serviço para criar a categoria no banco de dados
    const result = await EcommerceCategoryService.createCategory(
      validatedData,
      scope
    );

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

    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação do slug
    const validatedSlug = getCategoryBySlugSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para buscar a categoria
    const category = await EcommerceCategoryService.getCategoryBySlug(
      validatedSlug.slug,
      scope
    );
    return res.status(200).json(category);
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

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const parsedQuery = getAllCategoriesSchema.parse(req.query);
    const {
      name,
      slug,
      parentId,
      enterpriseId,
      search,
      page,
      perPage,
    } = parsedQuery;

    // Monta o objeto de filtro com os parâmetros recebidos
    const filter = {
      name,
      slug,
      parentId,
      enterpriseId,
      search,
    };

    const pagination = {
      page,
      perPage,
    };

    const categories = await EcommerceCategoryService.getAllCategories(scope, filter, pagination);
    return res.status(200).json(categories);
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

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getCategoryByIdSchema.parse(req.params);
    const validatedBody = updateCategorySchema.parse(req.body);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const updatedCategory = await EcommerceCategoryService.updateCategory(
      id,
      validatedBody.name,
      validatedBody.slug,
      scope
    );
    return res.status(200).json(updatedCategory);
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

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getCategoryByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const softDeleteCategory = await EcommerceCategoryService.deleteCategory(
      id,
      scope
    );

    return res.status(200).json({
      message: 'Categoria deletada lógicamente com sucesso!',
      category: softDeleteCategory,
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
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};
