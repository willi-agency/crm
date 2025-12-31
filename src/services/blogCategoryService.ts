/* src\services\blogCategoryService.ts */
import {
  BlogCategoryApiError,
  CategoryAlreadyDeletedError,
  CategoryNotFoundError,
  SlugAlreadyRegisteredError,
} from '../utils/blogCategoryApiError';
import * as blogCategoryModel from '../models/blogCategoryModel';
import { ScopeType } from '../types/scopeType';
import { CategoryFilterType } from '../types/categoryFilterType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';

export const createCategory = async (
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

  const existingCategory = await blogCategoryModel.findCategoryBySlug(slug, {
    enterpriseId: recEnterpriseId,
  });

  if (existingCategory.length > 0) {
    throw new SlugAlreadyRegisteredError();
  }

  try {
    const category = await blogCategoryModel.createCategory({
      name,
      slug,
      enterprise: {
        connect: { id: recEnterpriseId },
      },
    });

    return {
      message: 'Categoria cadastrada com sucesso!',
      category,
    };
  } catch (error) {
    if (error instanceof BlogCategoryApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllCategories = async (
  scope: ScopeType,
  filter: CategoryFilterType = {}
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const categories = await blogCategoryModel.findAllCategories(where, filter);
    return categories || [];
  } catch (error) {
    if (error instanceof BlogCategoryApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getCategoryBySlug = async (slug: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const categories = await blogCategoryModel.findCategoryBySlug(slug, where);

    if (!categories || categories.length < 1) {
      return 'Nenhuma categoria existente';
    }

    return categories;
  } catch (error) {
    if (error instanceof BlogCategoryApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const updateCategory = async (
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

  // 1. Busca a categoria existente
  const existingCategory = await blogCategoryModel.findCategoryById(id);
  if (!existingCategory) {
    throw new CategoryNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (
    enterpriseType === 'STANDARD' &&
    existingCategory.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  // 3. Valida se o novo slug já está em uso
  const where = { enterpriseId: existingCategory.enterpriseId };
  const categoryWithSameSlug = await blogCategoryModel.findCategoryBySlug(
    slug,
    where
  );
  const hasConflict = categoryWithSameSlug.some(
    (cat:any) => cat.id !== id // Evita acusar conflito com a própria tag
  );

  if (hasConflict) {
    throw new SlugAlreadyRegisteredError();
  }

  // 4. Atualiza
  try {
    const result = await blogCategoryModel.updateCategory(id, { name, slug });

    if (!result) {
      throw new Error('Erro ao tentar atualizar a categoria');
    }

    return result;
  } catch (error) {
    if (error instanceof BlogCategoryApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

// Função para soft delete de categoria
export const deleteCategory = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a categoria existe antes de tentar deletá-la
  const category = await blogCategoryModel.findCategoryById(id);
  if (!category) {
    throw new CategoryNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (
    enterpriseType === 'STANDARD' &&
    category?.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  if (category.deletedAt !== null) {
    throw new CategoryAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await blogCategoryModel.softDeleteCategory(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a categoria');
    }

    return result;
  } catch (error) {
    if (error instanceof BlogCategoryApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};
