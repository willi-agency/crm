// src/models/leadPipelineStageModel.ts
import prisma from '../../config/database';
import { LeadPipelineStageFilterType } from '../../types/lead/leadPipelineStageType';
import { getPaginationMeta, PaginationParams } from '../../utils/pagination';

export const createLeadPipelineStage = async (data: any) => {
  return prisma.leadPipelineStage.create({
    data,
  });
};

export const findLeadPipelineStageById = async (id: string) => {
  return prisma.leadPipelineStage.findUnique({
    where: { id },
    include: {
      pipeline: true,
    }
  });
};

export const findAllLeadPipelineStages = async (
  where?: { pipelineId?: string },
  filter: LeadPipelineStageFilterType = {},
  pagination?: PaginationParams
) => {
  const { name, order, pipelineId, search } = filter;

  // 🔍 Montagem dos filtros
  const filters: any = {
    ...where,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(order && { order: { contains: order, mode: 'insensitive' } }),
    ...(pipelineId && { pipelineId }),
  };

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { order: { contains: search, mode: 'insensitive' } },
      { pipelineId: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Total de registros
  const total = await prisma.leadPipelineStage.count({ where: filters });

  // Calcula paginação correta
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // Query paginada
  const data = await prisma.leadPipelineStage.findMany({
    where: filters,
    include: { pipeline: true },
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
export const updateLeadPipelineStage = async (
  id: string,
  data: any
) => {
  return prisma.leadPipelineStage.update({
    where: { id },
    data,
  });
};
