/* src\services\keywordPageService.ts */
import {
  KeywordPageApiError,
  KeywordPageAlreadyDeletedError,
  KeywordPageNotFoundError,
  SlugAlreadyRegisteredError,
} from '../utils/keywordPageApiError';
import * as keywordPageModel from '../models/keywordPageModel';
import { ScopeType } from '../types/scopeType';
import { KeywordPageFilterType } from '../types/keywordPageFilterType';
import {
  KeywordPageUpdateDTO,
} from '../types/keywordPageType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';
import { findApiKeyByKey } from '../models/apiKeyModel';
import { ApiKeyNotFoundError } from '../utils/apiKeyApiError';
import { uploadFileToUploadService } from './uploadFileToUploadService';
import { triggerEnterpriseRedeploy } from '../utils/triggerEnterpriseRedeploy';
import { processImagesInContent } from '../utils/processImageInContent';
import { CreateKeywordPageSchemaDTO } from '../schemas/KeywordPageSchemas';

export const createKeywordPage = async (
  data: CreateKeywordPageSchemaDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const {
    keyword,
    slug,
    description,
    title,
    thumbnail,
    content,
    enterpriseId: recEnterpriseId,
    keywordPageCategoryId,
    rawContent,
    contractId,
  } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (slug) {
    const existingKeywordPage = await keywordPageModel.findKeywordPageBySlug(
      slug,
      { enterpriseId: recEnterpriseId }
    );

    if (existingKeywordPage.length > 0) {
      throw new SlugAlreadyRegisteredError();
    }
  }

  let imageUrl: string | undefined;
  if (thumbnail && thumbnail.startsWith('data:image') && enterpriseId) {
    try {
      imageUrl = await uploadFileToUploadService(thumbnail, enterpriseId, slug);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error}`);
    }
  } else {
    imageUrl = thumbnail;
  }

  try {
    let processedContent: string | undefined;
    if (content) {
      processedContent = await processImagesInContent({ content, recEnterpriseId });
    }

    const dataToCreate: any = {
      keyword,
      slug,
      description,
      title,
      thumbnail: imageUrl,
      content: processedContent || content,
      rawContent,
      enterprise: {
        connect: { id: recEnterpriseId },
      },
      contract: contractId ? { connect: { id: contractId } } : undefined,
    };

    if (keywordPageCategoryId) {
      dataToCreate.keywordPageCategory = {
        connect: { id: keywordPageCategoryId },
      };
    }

    const keywordPage = await keywordPageModel.createKeywordPage(dataToCreate);

    // Trigger que dispara redeploy do site do cliente
    triggerEnterpriseRedeploy(recEnterpriseId);

    return {
      message: 'Keyword Page cadastrada com sucesso!',
      keywordPage,
    };
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar a keyword page');
  }
};

export const getAllKeywordPages = async (
  scope: ScopeType,
  filter: KeywordPageFilterType = {}
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const categories = await keywordPageModel.findAllKeywordPages(
      where,
      filter
    );
    return categories || [];
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllPublicKeywordPagesByApiKey = async (apiKey: string) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }

  const enterpriseId = AuthApiKeys.enterpriseId;
  const contractId = AuthApiKeys.contractId || undefined;

  try {
    const categories =
      await keywordPageModel.findPublicAllKeywordPages(enterpriseId, contractId);
    return categories || [];
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getPublicKeywordPageByApiKey = async (
  apiKey: string,
  slug: string
) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }
  const enterpriseId = AuthApiKeys.enterpriseId;

  const keywordPage = await keywordPageModel.findKeywordPageBySlug(slug, { enterpriseId });
  if (!keywordPage || enterpriseId !== keywordPage[0].enterpriseId) {
    throw new KeywordPageNotFoundError();
  }

  try {
    const keywordPage = await keywordPageModel.findPublicKeywordPage(
      enterpriseId,
      slug
    );

    return keywordPage || [];
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao buscar página');
  }
};

export const getKeywordPageBySlug = async (slug: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const categories = await keywordPageModel.findKeywordPageBySlug(
      slug,
      where
    );

    if (!categories || categories.length < 1) {
      return 'Nenhuma categoria existente';
    }

    return categories;
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getKeywordPageById = async (id: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const keyword = await keywordPageModel.findKeywordPageById(id);

    if (!keyword) {
      throw KeywordPageNotFoundError;
    }

    if (scope.enterpriseType === 'STANDARD' && keyword.enterpriseId !== scope.enterpriseId) {
      throw new NotPermissionForAction();
    }

    return keyword;

  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao procurar a keyword');
  }
};

export const getKeywordPageByEnterpriseId = async (id: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (scope.enterpriseType === 'STANDARD' && id !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const categories = await keywordPageModel.findKeywordPageByEnterpriseId(id);

    if (!categories) {
      return 'Nenhuma keyword existente';
    }

    return categories;
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao procurar a keyword');
  }
};

export const updateKeywordPage = async (
  id: string,
  data: KeywordPageUpdateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { content, keyword, title, description, keywordPageCategoryId, thumbnail, slug, rawContent } =
    data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca o keyword existente
  const existingKeyword = await keywordPageModel.findKeywordPageById(id);
  if (!existingKeyword) {
    throw new KeywordPageNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar
  if (
    enterpriseType === 'STANDARD' &&
    existingKeyword.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  let imageUrl: string | undefined;
  if (thumbnail && thumbnail.startsWith('data:image') && existingKeyword.enterpriseId) {
    try {
      const slugToUse = slug ?? existingKeyword.slug;
      imageUrl = await uploadFileToUploadService(thumbnail, existingKeyword.enterpriseId, slugToUse || undefined);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error}`);
    }
  } else {
    imageUrl = thumbnail;
  }

  // 3. Atualiza
  try {
    let processedContent: string | undefined;
    if (content) {
      processedContent = await processImagesInContent({ content, recEnterpriseId: existingKeyword.enterpriseId });
    }

    const dataToCreate: any = {
      content: processedContent,
      keyword,
      thumbnail: imageUrl,
      slug,
      rawContent,
      title,
      description,
    };

    if (keywordPageCategoryId) {
      dataToCreate.keywordPageCategory = {
        connect: { id: keywordPageCategoryId },
      };
    }

    const result = await keywordPageModel.updateKeywordPage(id, dataToCreate);

    if (!result) {
      throw new Error('Erro ao tentar atualizar a keywordpage');
    }
    // Trigger que dispara redeploy do site do cliente
    triggerEnterpriseRedeploy(existingKeyword.enterpriseId).catch((err) => {
      console.error(`Erro ao disparar redeploy para enterprise ${existingKeyword.enterpriseId}:`, err);
    });

    return result;
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao atualizar a keywordpage');
  }
};

// Função para soft delete de categoria
export const deleteKeywordPage = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a categoria existe antes de tentar deletá-la
  const keywordPage = await keywordPageModel.findKeywordPageById(id);
  if (!keywordPage) {
    throw new KeywordPageNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (
    enterpriseType === 'STANDARD' &&
    keywordPage?.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  if (keywordPage.deletedAt !== null) {
    throw new KeywordPageAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await keywordPageModel.softDeleteKeywordPage(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a keyword');
    }

    // Trigger que dispara redeploy do site do cliente
    triggerEnterpriseRedeploy(keywordPage.enterpriseId).catch((err) => {
      console.error(`Erro ao disparar redeploy para enterprise ${keywordPage.enterpriseId}:`, err);
    });

    return result;
  } catch (error) {
    if (error instanceof KeywordPageApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao deletar');
  }
};
