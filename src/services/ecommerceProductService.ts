//src\services\ecommerceProductService.ts
import {
  EcommerceProductApiError,
  ProductAlreadyDeletedError,
  ProductNotFoundError,
  SlugAlreadyRegisteredError,
} from '../utils/ecommerceProductApiError';
import * as ecommerceProductModel from '../models/ecommerceProductModel';
import { ScopeType } from '../types/scopeType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';
import { EcommerceProductCreateDTO } from '../types/ecommerceProductType';
import { EcommerceProductFilterType } from '../types/ecommerceProductFilterType';
import { PaginationParams } from '../utils/pagination';

export const createProduct = async (
  data: EcommerceProductCreateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, slug, enterpriseId: recEnterpriseId, categoryId, description, enabled, price, sku, visible } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verifica se o usuário tem permissão
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  // Verifica slug duplicado
  const existingProduct = await ecommerceProductModel.findEcommerceProductBySlug(slug, {
    enterpriseId: recEnterpriseId,
  });

  if (existingProduct.length > 0) {
    throw new SlugAlreadyRegisteredError();
  }

  // Faz a criação
  try {
    const category = await ecommerceProductModel.createEcommerceProduct({ name, slug, enterpriseId: recEnterpriseId, categoryId, description, enabled, price, sku, visible });

    return {
      message: 'Categoria cadastrada com sucesso!',
      category,
    };
  } catch (error) {
    if (error instanceof EcommerceProductApiError) {
      throw error;
    }
    throw new Error('Erro interno ao cadastrar');
  }
};

export const getAllProducts = async (
  scope: ScopeType,
  filter: EcommerceProductFilterType = {},
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
    const products = await ecommerceProductModel.findAllProducts(where, filter, pagination);
    return products || [];
  } catch (error) {
    if (error instanceof EcommerceProductApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao consultar');
  }
};

export const getProductBySlug = async (slug: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const categories = await ecommerceProductModel.findEcommerceProductBySlug(slug, where);

    if (!categories || categories.length < 1) {
      return 'Nenhuma categoria existente';
    }

    return categories;
  } catch (error) {
    if (error instanceof EcommerceProductApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const updateProduct = async (
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
  const existingProduct = await ecommerceProductModel.findEcommerceProductById(id);
  if (!existingProduct) {
    throw new ProductNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (
    enterpriseType === 'STANDARD' &&
    existingProduct.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  // 3. Valida se o novo slug já está em uso
  const where = { enterpriseId: existingProduct.enterpriseId };
  const categoryWithSameSlug = await ecommerceProductModel.findEcommerceProductBySlug(
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
    const result = await ecommerceProductModel.updateEcommerceProduct(id, { name, slug });

    if (!result) {
      throw new Error('Erro ao tentar atualizar a categoria');
    }

    return result;
  } catch (error) {
    if (error instanceof EcommerceProductApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

// Função para soft delete de categoria
export const deleteProduct = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a categoria existe antes de tentar deletá-la
  const category = await ecommerceProductModel.findEcommerceProductById(id);
  if (!category) {
    throw new ProductNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (
    enterpriseType === 'STANDARD' &&
    category?.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  if (category.deletedAt !== null) {
    throw new ProductAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await ecommerceProductModel.softDeleteEcommerceProduct(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a categoria');
    }

    return result;
  } catch (error) {
    if (error instanceof EcommerceProductApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};
