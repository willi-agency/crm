// src/services/tagService.ts
import { ScopeType } from '../types/scopeType';
import * as BlogTagModel from '../models/blogTagModel';
import {
  BlogTagApiError,
  SlugAlreadyRegisteredError,
  TagAlreadyDeletedError,
  TagNotFoundError,
} from '../utils/blogTagApiError';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';

export const createTag = async (
  name: string,
  slug: string,
  recEnterpriseId: string,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  const existingCategory = await BlogTagModel.findTagBySlug(slug, {
    enterpriseId: recEnterpriseId,
  });

  if (existingCategory.length > 0) {
    throw new SlugAlreadyRegisteredError();
  }

  try {
    const tag = await BlogTagModel.createTag({
      name,
      slug,
      enterprise: {
        connect: { id: recEnterpriseId },
      },
    });

    return {
      message: 'tag cadastrada com sucesso!',
      tag,
    };
  } catch (error) {
    if (error instanceof BlogTagApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllTags = async (
  scope: ScopeType,
  filter: TagFilterType = {}
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const tags = await BlogTagModel.findAllTags(where, filter);
    return tags || [];
  } catch (error) {
    if (error instanceof BlogTagApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getTagBySlug = async (slug: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const tags = await BlogTagModel.findTagBySlug(slug, where);

    if (!tags || tags.length < 1) {
      return 'Nenhuma tag existente';
    }

    return tags;
  } catch (error) {
    if (error instanceof TagNotFoundError) {
      throw error;
    }
    throw new Error('Erro ao buscar a tag');
  }
};

export const updateTag = async (
  id: string,
  name: string,
  slug: string,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca a tag existente
  const existingTag = await BlogTagModel.findTagById(id);
  if (!existingTag) {
    throw new TagNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (
    enterpriseType === 'STANDARD' &&
    existingTag.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  // 3. Valida se o novo slug já está em uso (por outra tag da mesma empresa)
  const where = { enterpriseId: existingTag.enterpriseId };
  const categoryWithSameSlug = await BlogTagModel.findTagBySlug(slug, where);
  const hasConflict = categoryWithSameSlug.some(
    (cat) => cat.id !== id // Evita acusar conflito com a própria tag
  );

  if (hasConflict) {
    throw new SlugAlreadyRegisteredError();
  }

  // 4. Atualiza
  try {
    const result = await BlogTagModel.updateTag(id, { name, slug });

    if (!result) {
      throw new Error('Erro ao tentar atualizar a tag');
    }

    return result;
  } catch (error) {
    if (error instanceof BlogTagApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const deleteTag = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a tag existe antes de tentar deletá-la
  const tag = await BlogTagModel.findTagById(id);

  if (!tag) {
    throw new TagNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (enterpriseType === 'STANDARD' && tag?.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (tag.deletedAt !== null) {
    throw new TagAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await BlogTagModel.softDeleteTag(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a tag');
    }

    return result;
  } catch (error) {
    if (error instanceof BlogTagApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};
