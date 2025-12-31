// src/models/leadPipelineModel.ts
import prisma from '../../config/database';
import { LeadPipelineFilterType } from '../../types/lead/leadPipelineType';
import { getPaginationMeta, PaginationParams } from '../../utils/pagination';

export const createLeadPipeline = async (data: any) => {
  return prisma.leadPipeline.create({
    data,
  });
};

export const findLeadPipelineById = async (id: string) => {
  return prisma.leadPipeline.findUnique({
    where: { id },
  });
};

export const findAllLeadPipelines = async (
  where?: { enterpriseId?: string },
  filter: LeadPipelineFilterType = {},
  pagination?: PaginationParams
) => {
  const { name, description, enterpriseId, search } = filter;

  // 🔍 Montagem dos filtros
  const filters: any = {
    isActive: true,
    ...where,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(description && { description: { contains: description, mode: 'insensitive' } }),
    ...(enterpriseId && { enterpriseId }),
  };

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { enterpriseId: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Total de registros
  const total = await prisma.leadPipeline.count({ where: filters });

  // Calcula paginação correta
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  const data = await prisma.leadPipeline.findMany({
    where: filters,
    include: {
      enterprise: {
        select: {
          name: true,
          cnpj: true,
          logo: true,
        },
      },
      stages: {
        select: {
          id: true,
          name: true,
          order: true,
        },
        orderBy: { order: 'asc' },
      },
    },
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

// Função para atualizar uma pipeline
export const updateLeadPipeline = async (
  id: string,
  data: any
) => {
  return prisma.leadPipeline.update({
    where: { id },
    data,
  });
};