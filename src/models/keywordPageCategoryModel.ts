// src/models/KeywordPageCategoryModel.ts
import { keywordPageCategoryCreateDTO } from '../types/keywordPageCategoryType';
import prisma from '../config/database';
import { KeywordPageCategoryFilterType } from '../types/keywordPageCategoryFilterType';
import { getPaginationMeta, PaginationParams } from '../utils/pagination';

// Função para criar uma categoria
export const createKeywordPageCategory = async (data: keywordPageCategoryCreateDTO) => {
  return prisma.keywordPageCategory.create({
    data,
  });
};

// Função para buscar categoria por slug
export const findKeywordPageCategoryBySlug = async (
  slug: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.keywordPageCategory.findMany({
    where: {
      deletedAt: null,
      slug,
      ...where,
    },
  });
};

// Função para buscar categoria por id
export const findKeywordPageCategoryById = async (id: string) => {
  return prisma.keywordPageCategory.findUnique({
    where: { deletedAt: null, id },
  });
};

// Função para listar todas as categorias
export const findAllCategories = async (
  where?: { enterpriseId?: string },
  filter: KeywordPageCategoryFilterType = {},
  pagination?: PaginationParams
) => {
  const { name, slug, enterpriseId, search } = filter;

  // 🔍 Montagem dos filtros
  const filters: any = {
    deletedAt: null,
    ...where,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(slug && { slug: { contains: slug, mode: 'insensitive' } }),
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
  const total = await prisma.keywordPageCategory.count({ where: filters });

  // ⚙️ Calcula paginação correta
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // 🔥 Query paginada
  const data = await prisma.keywordPageCategory.findMany({
    where: filters,
    include: { enterprise: true },
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
export const updateKeywordPageCategory = async (
  id: string,
  data: any
) => {
  return prisma.keywordPageCategory.update({
    where: { deletedAt: null, id },
    data,
  });
};

// Função para deletar uma categoria
export const softDeleteKeywordPageCategory = async (id: string) => {
  return prisma.keywordPageCategory.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
