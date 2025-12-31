// src/services/artigoService.ts
import { ScopeType } from '../types/scopeType';
import * as BlogArticleModel from '../models/blogArticleModel';
import {
  SlugAlreadyRegisteredError,
  ArticleAlreadyDeletedError,
  ArticleNotFoundError,
  BlogArticleApiError,
  NotExistData,
} from '../utils/blogArticleApiError';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';
import {
  BlogArticleCreateDTO,
  BlogArticleUpdateDTO,
} from '../types/blogArticle';
import { ArticleFilterType } from '../types/articleFilterType';
import { uploadFileToUploadService } from './uploadFileToUploadService';
import { findApiKeyByKey } from '../models/apiKeyModel';
import { ApiKeyNotFoundError } from '../utils/apiKeyApiError';
import { triggerEnterpriseRedeploy } from '../utils/triggerEnterpriseRedeploy';
import { processImagesInContent } from '../utils/processImageInContent';

type ScopeTypeArticle = ScopeType & { userId: string };

export const createArticle = async (
  data: BlogArticleCreateDTO,
  scope: ScopeTypeArticle
) => {
  const { enterpriseType, enterpriseId, userId } = scope;
  const {
    title,
    description,
    content,
    slug,
    authorId,
    datePublished,
    categoryId,
    status,
    enterpriseId: recEnterpriseId,
    contractId,
    rawContent,
    image,
    tagIds = [],
  } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para editar
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  const existingArticle = await BlogArticleModel.findArticleBySlug(slug, {
    enterpriseId: recEnterpriseId,
  });

  if (existingArticle.length > 0) {
    throw new SlugAlreadyRegisteredError();
  }

  let imageUrl: string | undefined;
  if (image && image.startsWith('data:image') && recEnterpriseId) {
    try {
      imageUrl = await uploadFileToUploadService(image, recEnterpriseId, slug);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error}`);
    }
  } else {
    imageUrl = image;
  }

  try {
    // 3. Processa o conteúdo com imagens base64 embutidas e faz upload
    const processedContent = await processImagesInContent({ content, recEnterpriseId });

    const artigo = await BlogArticleModel.createArticle({
      title,
      description,
      image: imageUrl,
      content: processedContent,
      rawContent,
      slug,
      author: {
        connect: { id: authorId },
      },
      datePublished,
      status,
      category: {
        connect: { id: categoryId },
      },
      tags:
        tagIds.length > 0
          ? {
            connect: tagIds.map((id) => ({ id })),
          }
          : undefined,
      enterprise: {
        connect: { id: recEnterpriseId },
      },
      contract: contractId
        ? { connect: { id: contractId } }
        : undefined,
      createdBy: {
        connect: { id: userId },
      },
    });

    if (status === 'PUBLISHED') {
      // Trigger que dispara redeploy do site do cliente
      triggerEnterpriseRedeploy(recEnterpriseId).catch((err) => {
        console.error(`Erro ao disparar redeploy para enterprise ${recEnterpriseId}:`, err);
      });
    }

    return {
      message: 'Artigo cadastrado com sucesso!',
      artigo,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    throw new Error('Erro interno ao criar o artigo');
  }
};

export const getAllArticles = async (
  scope: ScopeType,
  filter: ArticleFilterType = {}
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const artigos = await BlogArticleModel.findAllArticles(where, filter);
    return artigos || [];
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllPublicArticlesByApiKey = async (apiKey: string) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }

  const enterpriseId = AuthApiKeys.enterpriseId;
  const contractId = AuthApiKeys.contractId || undefined;

  try {
    const articles = await BlogArticleModel.findPublicAllArticles(enterpriseId, contractId);
    return articles;
    
  } catch (error) {
    console.log(error);
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getPublicArticleByApiKey = async (
  apiKey: string,
  slug: string
) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }
  console.log('apiKey: ', AuthApiKeys);
  const enterpriseId = AuthApiKeys.enterpriseId;
  const article = await BlogArticleModel.findPublicArticle(slug, enterpriseId);

  console.log('artigo', article);
  const articcleEnterprise = article?.enterpriseId;

  console.log('id da empresa na ApiKey: ', enterpriseId);
  console.log('id da empresa no Article: ', articcleEnterprise);

  try {
    const article = await BlogArticleModel.findPublicArticle(slug, enterpriseId);

    if (!article || enterpriseId !== article.enterpriseId) {
      throw new ArticleNotFoundError();
    }

    return article || [];
  
  } catch (error) {
    console.log(error);
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getArticleByName = async (name: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const artigos = await BlogArticleModel.findArticleBySlug(name, where);

    if (!artigos || artigos.length < 1) {
      return 'Nenhum artigo encontrado';
    }

    return artigos;
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getArticleById = async (id: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (scope.enterpriseType === 'STANDARD' && id !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const artigos = await BlogArticleModel.findArticleById(id);

    if (!artigos) {
      return 'Nenhum artigo encontrado';
    }

    return artigos;
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao buscar artigo');
  }
};

export const getArticleCreationData = async (id: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (scope.enterpriseType === 'STANDARD' && id !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const creationData = await BlogArticleModel.findArticleCreationData(id);
    if (!creationData.authors.length && !creationData.categories.length) {
      throw new NotExistData();
    }

    return creationData;
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao buscar dados para criação de artigo');
  }
};

export const updateArticle = async (
  id: string,
  data: BlogArticleUpdateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const {
    title,
    description,
    content,
    slug,
    status,
    authorId,
    datePublished,
    categoryId,
    tagIds = [],
    image,
  } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca o artigo existente
  const existingArticle = await BlogArticleModel.findArticleById(id);
  if (!existingArticle) {
    throw new ArticleNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar
  if (
    enterpriseType === 'STANDARD' &&
    existingArticle.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  if (slug) {
    // 3. Valida se o novo slug já está em uso (por outra tag da mesma empresa)
    const where = { enterpriseId: existingArticle.enterpriseId };
    const categoryWithSameSlug = await BlogArticleModel.findArticleBySlug(
      slug,
      where
    );
    const hasConflict = categoryWithSameSlug.some((cat: any) => cat.id !== id);
    if (hasConflict) {
      throw new SlugAlreadyRegisteredError();
    }
  }

  let imageUrl: string | undefined;
  if (image && image.startsWith('data:image') && enterpriseId) {
    try {
      imageUrl = await uploadFileToUploadService(image, enterpriseId, slug);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error}`);
    }
  } else {
    imageUrl = image;
  }

  // 3. Atualiza
  try {
    let processedContent: string | undefined;
    if (content) {
      processedContent = await processImagesInContent({ content, recEnterpriseId: enterpriseId });
    }

    
    const result = await BlogArticleModel.updateArticle(id, {
      title,
      description,
      image: imageUrl,
      content: processedContent || content,
      slug,
      status,
      datePublished,
      ...(authorId && { author: { connect: { id: authorId } } }),
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      tags: {
        set: tagIds.map((id) => ({ id })),
      },
    });

    if (!result) {
      throw new Error('Erro ao tentar atualizar o artigo');
    }

    // Trigger que dispara redeploy do site do cliente
    triggerEnterpriseRedeploy(existingArticle.enterpriseId).catch((err) => {
      console.error(`Erro ao disparar redeploy para enterprise ${existingArticle.enterpriseId}:`, err);
    });      

    return result;
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro ao tentar atualizar');
  }
};

export const deleteArticle = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se o artigo existe antes de tentar deletá-la
  const artigo = await BlogArticleModel.findArticleById(id);

  if (!artigo) {
    throw new ArticleNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (enterpriseType === 'STANDARD' && artigo?.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (artigo.deletedAt !== null) {
    throw new ArticleAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await BlogArticleModel.softDeleteArticle(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar o artigo');
    }

    triggerEnterpriseRedeploy(artigo.enterpriseId).catch((err) => {
      console.error(`Erro ao disparar redeploy para enterprise ${artigo.enterpriseId}:`, err);
    });

    return result;
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};
