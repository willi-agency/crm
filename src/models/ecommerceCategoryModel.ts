// src/models/EcommerceCategoryModel.ts
import prisma from '../config/database';
import { EcommerceCategoryFilterType } from '../types/ecommerceCategoryFilterType';
import { getPaginationMeta, PaginationParams } from '../utils/pagination';

// Função para criar uma categoria
export const createEcommerceCategory = async (data: any) => {
  return prisma.ecommerceCategory.create({
    data,
  });
};

// Função para buscar categoria por slug
export const findEcommerceCategoryBySlug = async (
  slug: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.ecommerceCategory.findMany({
    where: {
      deletedAt: null,
      slug,
      ...where,
    },
  });
};

// Função para buscar categoria por id
export const findEcommerceCategoryById = async (id: string) => {
  return prisma.ecommerceCategory.findUnique({
    where: { deletedAt: null, id },
  });
};

// Função para listar todas as categorias
//src\models\ecommerceCategoryModel.ts
export const findAllCategories = async (
  where?: { enterpriseId?: string },
  filter: EcommerceCategoryFilterType = {},
  pagination?: PaginationParams
) => {
  const { name, slug, parentId, enterpriseId, search } = filter;

  // 🔍 Montagem dos filtros
  const filters: any = {
    deletedAt: null,
    ...where,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(slug && { slug: { contains: slug, mode: 'insensitive' } }),
    ...(parentId && { parentId }),
    ...(enterpriseId && { enterpriseId }),
  };

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { enterpriseId: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 🔢 Total de registros
  const total = await prisma.ecommerceCategory.count({ where: filters });

  // ⚙️ Calcula paginação correta
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // 🔥 Query paginada
  const data = await prisma.ecommerceCategory.findMany({
    where: filters,
    include: { enterprise: true },
    orderBy: { createdAt: 'desc' },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
  });

  return {
    data,
    pagination: {
      total: paginationMeta.total,
      page: paginationMeta.page,
      perPage: paginationMeta.perPage,
      totalPages: paginationMeta.totalPages,
    },
  };
};

// Função para atualizar uma categoria
export const updateEcommerceCategory = async (
  id: string,
  data: any
) => {
  return prisma.ecommerceCategory.update({
    where: { deletedAt: null, id },
    data,
  });
};

// Função para deletar uma categoria
export const softDeleteEcommerceCategory = async (id: string) => {
  return prisma.ecommerceCategory.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
