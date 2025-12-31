//src/schemas/enterprise/enterpriseServiceSchemas.ts

import prisma from '../../config/database';
import { FindServiceFilter } from '../../schemas/enterprise/enterpriseServiceSchemas';
import { getPaginationMeta, PaginationParams } from '../../utils/pagination';

// =============== CREATE ===============
export const createService = async (data: any) => {
  return prisma.service.create({
    data,
  });
};

// =============== FIND BY ID ===============
export const findServiceById = async (id: string) => {
  return prisma.service.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      contracts: {
        select: { id: true, name: true, code: true },
      },
    },
  });
};

// =============== FIND ALL (FILTRAGEM + PAGINAÇÃO) ===============
export const findAllServices = async (
  filter: FindServiceFilter = {},
  pagination?: PaginationParams
) => {
  const { name, status } = filter;

  const filters: any = {
    deletedAt: null,
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(status && { status }),
  };

  // Total de registros
  const total = await prisma.service.count({ where: filters });

  // Paginação
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // Busca com paginação
  const data = await prisma.service.findMany({
    where: filters,
    include: {
      contracts: {
        select: { id: true, name: true, code: true },
      },
    },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
    orderBy: { createdAt: 'desc' },
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

// =============== UPDATE ===============
export const updateService = async (id: string, data: any) => {
  return prisma.service.update({
    where: {
      id,
      deletedAt: null,
    },
    data,
  });
};

// =============== SOFT DELETE ===============
export const softDeleteService = async (id: string) => {
  return prisma.service.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

// =============== COUNT TOTAL ===============
export const countServices = async () => {
  return prisma.service.count();
};
