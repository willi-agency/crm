//src\services\ecommerceCategoryService.ts
import {
  EcommerceCategoryApiError,
  CategoryAlreadyDeletedError,
  CategoryNotFoundError,
  SlugAlreadyRegisteredError,
} from '../utils/ecommerceCategoryApiError';
import * as ecommerceCategoryModel from '../models/ecommerceCategoryModel';
import { ScopeType } from '../types/scopeType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';
import { ecommerceCategoryCreateDTO } from '../types/ecommerceCategoryType';
import { EcommerceCategoryFilterType } from '../types/ecommerceCategoryFilterType';
import { PaginationParams } from '../utils/pagination';

export const createCategory = async (
  data: ecommerceCategoryCreateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, slug, enterpriseId: recEnterpriseId, parentId } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verifica se o usuário tem permissão
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  // Verifica slug duplicado
  const existingCategory = await ecommerceCategoryModel.findEcommerceCategoryBySlug(slug, {
    enterpriseId: recEnterpriseId,
  });

  if (existingCategory.length > 0) {
    throw new SlugAlreadyRegisteredError();
  }

  // Monta dinamicamente o objeto de dados
  const dataToCreate: any = {
    name,
    slug,
    enterprise: {
      connect: { id: recEnterpriseId },
    },
  };

  if (parentId) {
    dataToCreate.parent = {
      connect: { id: parentId },
    };
  }

  // Faz a criação
  try {
    const category = await ecommerceCategoryModel.createEcommerceCategory(dataToCreate);

    return {
      message: 'Categoria cadastrada com sucesso!',
      category,
    };
  } catch (error) {
    if (error instanceof EcommerceCategoryApiError) {
      throw error;
    }
    throw new Error('Erro interno ao cadastrar');
  }
};

export const getAllCategories = async (
  scope: ScopeType,
  filter: EcommerceCategoryFilterType = {},
  pagination?: PaginationParams
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const categories = await ecommerceCategoryModel.findAllCategories(where, filter, pagination);
    return categories || [];
  } catch (error) {
    if (error instanceof EcommerceCategoryApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao consultar');
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
    const categories = await ecommerceCategoryModel.findEcommerceCategoryBySlug(slug, where);

    if (!categories || categories.length < 1) {
      return 'Nenhuma categoria existente';
    }

    return categories;
  } catch (error) {
    if (error instanceof EcommerceCategoryApiError) {
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
  const existingCategory = await ecommerceCategoryModel.findEcommerceCategoryById(id);
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
  const categoryWithSameSlug = await ecommerceCategoryModel.findEcommerceCategoryBySlug(
    slug,
    where
  );
  const hasConflict = categoryWithSameSlug.some(
    (cat: any) => cat.id !== id // Evita acusar conflito com a própria tag
  );

  if (hasConflict) {
    throw new SlugAlreadyRegisteredError();
  }

  // 4. Atualiza
  try {
    const result = await ecommerceCategoryModel.updateEcommerceCategory(id, { name, slug });

    if (!result) {
      throw new Error('Erro ao tentar atualizar a categoria');
    }

    return result;
  } catch (error) {
    if (error instanceof EcommerceCategoryApiError) {
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
  const category = await ecommerceCategoryModel.findEcommerceCategoryById(id);
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
    const result = await ecommerceCategoryModel.softDeleteEcommerceCategory(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a categoria');
    }

    return result;
  } catch (error) {
    if (error instanceof EcommerceCategoryApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};
