/* src/controllers/KeywordPageController.ts */
import { Request, Response } from 'express';
import * as KeywordPageService from '../services/keywordPageService';
import { ZodError } from 'zod';
import {
  createKeywordPageSchema,
  getKeywordPageBySlugSchema,
  getKeywordPageByIdSchema,
  CreateKeywordPageSchemaDTO,
  UpdateKeywordPageSchemaDTO,
  updateKeywordPageSchema,
  keywordIdSchema,
} from '../schemas/KeywordPageSchemas';
import { ScopeType } from '../types/scopeType';
import { reqApiKey } from '../schemas/reqApiKeyPublicRoute';

export const createKeywordPage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const validatedData: CreateKeywordPageSchemaDTO =
      createKeywordPageSchema.parse(req.body);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para criar a categoria no banco de dados
    const result = await KeywordPageService.createKeywordPage(
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

export const getKeywordPageBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação do slug
    const validatedSlug = getKeywordPageBySlugSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para buscar a categoria
    const keywordPage = await KeywordPageService.getKeywordPageBySlug(
      validatedSlug.slug,
      scope
    );
    return res.status(200).json(keywordPage);
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

export const getKeywordPageById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getKeywordPageByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const keywordPage = await KeywordPageService.getKeywordPageById(id, scope);

    return res.status(200).json(keywordPage);
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

export const getKeywordPageByEnterpriseId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getKeywordPageByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const keywordPage = await KeywordPageService.getKeywordPageByEnterpriseId(id, scope);

    return res.status(200).json(keywordPage);
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

export const getAllKeywordPages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const keywordPages = await KeywordPageService.getAllKeywordPages(scope);
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

export const getAllPublicKeywordPagesByApiKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { apiKey } = reqApiKey.parse(req.params);

    const keywordPages =
      await KeywordPageService.getAllPublicKeywordPagesByApiKey(apiKey);
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

export const getPublicKeywordPageByApiKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { apiKey } = reqApiKey.parse(req.params);
    const { slug } = getKeywordPageBySlugSchema.parse(req.params);

    const keywordPages = await KeywordPageService.getPublicKeywordPageByApiKey(
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

export const updateKeywordPages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getKeywordPageByIdSchema.parse(req.params);
    // Validação dos dados de entrada com Zod
    const validatedData: UpdateKeywordPageSchemaDTO =
      updateKeywordPageSchema.parse(req.body);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const updateKeywordPage = await KeywordPageService.updateKeywordPage(
      id,
      validatedData,
      scope
    );
    return res.status(200).json(updateKeywordPage);
  } catch (err: any) {
    // Validação com zod
    console.log('erro passado no controller: ', err);
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

export const deleteKeywordPage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const id = keywordIdSchema.parse(req.params.id);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    const softDeleteKeywordPage = await KeywordPageService.deleteKeywordPage(
      id,
      scope
    );

    return res.status(200).json({
      message: 'Keyword Page deletada lógicamente com sucesso!',
      keywordPage: softDeleteKeywordPage,
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
