// src/models/EcommerceProductModel.ts
import { EcommerceProductCreateDTO, EcommerceProductImageCreateDTO, EcommerceProductImageUpdateDTO, EcommerceProductUpdateDTO } from '../types/ecommerceProductType';
import prisma from '../config/database';
import { EcommerceProductFilterType } from '../types/ecommerceProductFilterType';
import { getPaginationMeta, PaginationParams } from '../utils/pagination';

// Função para criar um produto
export const createEcommerceProduct = async (data: EcommerceProductCreateDTO) => {
  return prisma.ecommerceProduct.create({
    data,
  });
};

// Função para buscar produto por slug
export const findEcommerceProductBySlug = async (
  slug: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.ecommerceProduct.findMany({
    where: {
      deletedAt: null,
      slug,
      ...where,
    },
  });
};

// Função para buscar produto por id
export const findEcommerceProductById = async (id: string) => {
  return prisma.ecommerceProduct.findUnique({
    where: { deletedAt: null, id },
  });
};

// Função para listar todas as produtos
export const findAllProducts = async (
  where?: { enterpriseId?: string },
  filter: EcommerceProductFilterType = {},
  pagination?: PaginationParams
) => {
  const {
    name, slug, search, description,
    enterpriseId, categoryId, enabled, visible,
    price, sku,
  } = filter;

  const filters: any = {
    deletedAt: null,
    ...where,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(slug && { slug: { contains: slug, mode: 'insensitive' } }),
    ...(description && { description: { contains: description, mode: 'insensitive' } }),
    ...(sku && { sku: { contains: sku, mode: 'insensitive' } }),
    ...(enterpriseId && { enterpriseId }),
    ...(categoryId && { categoryId }),
    ...(price && { price }),
    ...(enabled !== undefined && { enabled }),
    ...(visible !== undefined && { visible }),
  };

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.ecommerceProduct.count({ where: filters });

  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  const data = await prisma.ecommerceProduct.findMany({
    where: filters,
    include: { enterprise: true, ecommerceCategory: true },
    orderBy: { createdAt: 'desc' },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
  });

  return {
    data,
    pagination: paginationMeta,
  };
};

// Função para atualizar um produto
export const updateEcommerceProduct = async (
  id: string,
  data: EcommerceProductUpdateDTO
) => {
  return prisma.ecommerceProduct.update({
    where: { deletedAt: null, id },
    data,
  });
};

// Função para deletar um produto
export const softDeleteEcommerceProduct = async (id: string) => {
  return prisma.ecommerceProduct.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

// Função para criar um produto
export const createEcommerceProductImage = async (data: EcommerceProductImageCreateDTO) => {
  return prisma.ecommerceProductImage.create({
    data,
  });
};

// Função para atualizar um produto
export const updateEcommerceImageProduct = async (
  id: string,
  data: EcommerceProductImageUpdateDTO
) => {
  return prisma.ecommerceProductImage.update({
    where: { id },
    data,
  });
};