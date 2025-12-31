// src/models/enterprise/enterpriseContractModel.ts
import prisma from '../../config/database';
import {
  FindContractFilter,
} from '../../schemas/enterprise/enterpriseContractSchemas';
import { getPaginationMeta, PaginationParams } from '../../utils/pagination';

// =============== CREATE ===============
export const createContract = async (
  contractData: any,
  siteDetails?: any
) => {
  return prisma.$transaction(async (tx) => {
    // Criar contrato principal
    const contract = await tx.contract.create({
      data: contractData,
    });

    // Criar detalhes somente se enviados
    if (siteDetails) {
      await tx.siteContractDetails.create({
        data: {
          contractId: contract.id,
          ...siteDetails,
        },
      });
    }

    return contract;
  });
};

export const createContractDetails = async (data: any) => {
  return prisma.siteContractDetails.create({
    data,
  });
};

// =============== FIND BY ID ===============
export const findContractById = async (id: string) => {
  return prisma.contract.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      enterprise: {
        select: { id: true, name: true },
      },
      service: {
        select: { id: true, name: true },
      },
      SiteContractDetails: true,
    },
  });
};

export const findContractDetailsById = async (contractId: string) => {
  return prisma.siteContractDetails.findFirst({
    where: { contractId },
  });
};

// =============== FIND BY CODE ===============
export const findContractByCode = async (code: string, enterpriseId?: string,) => {
  return prisma.contract.findFirst({
    where: {
      code,
      deletedAt: null,
    },
    include: {
      enterprise: {
        select: { id: true, name: true },
      },
      service: {
        select: { id: true, name: true },
      },
      SiteContractDetails: true,
    },
  });
};

// =============== FIND ALL (FILTRAGEM + PAGINAÇÃO) ===============
export const findAllContracts = async (
  filter: FindContractFilter = {},
  pagination?: PaginationParams
) => {
  const {
    enterpriseId,
    serviceId,
    name,
    code,
    status,
    financialStatus,
    billingCycle,
    startDate,
    endDate,
  } = filter;

  const filters: any = {
    deletedAt: null,
    ...(enterpriseId && { enterpriseId }),
    ...(serviceId && { serviceId }),
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
    ...(code && { code: { contains: code, mode: 'insensitive' } }),
    ...(status && { status }),
    ...(financialStatus && { financialStatus }),
    ...(billingCycle && { billingCycle }),
  };

  // Se quiser filtrar intervalo de datas
  if (startDate || endDate) {
    filters.startDate = {};
    if (startDate) filters.startDate.gte = new Date(startDate);
    if (endDate) filters.startDate.lte = new Date(endDate);
  }

  // Total de registros
  const total = await prisma.contract.count({ where: filters });

  // Paginação
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // Busca com paginação
  const data = await prisma.contract.findMany({
    where: filters,
    include: {
      enterprise: {
        select: { id: true, name: true },
      },
      service: {
        select: { id: true, name: true },
      },
      SiteContractDetails: true,
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
export const updateContract = async (
  id: string,
  contractData: any,
  siteDetails?: any
) => {
  return prisma.$transaction(async (tx) => {
    // Atualizar o contrato principal
    const updatedContract = await tx.contract.update({
      where: { id },
      data: contractData,
    });

    if (siteDetails) {
      const existingDetails = await tx.siteContractDetails.findUnique({
        where: { contractId: id },
      });

      if (existingDetails) {
        await tx.siteContractDetails.update({
          where: { contractId: id },
          data: siteDetails,
        });
      } else {
        await tx.siteContractDetails.create({
          data: {
            contractId: id,
            ...siteDetails,
          },
        });
      }
    }

    return updatedContract;
  });
};

// =============== SOFT DELETE ===============
export const softDeleteContract = async (id: string) => {
  return prisma.contract.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

// =============== COUNT TOTAL ===============
export const countContracts = async () => {
  return prisma.contract.count();
};
