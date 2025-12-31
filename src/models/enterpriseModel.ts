// src/models/EnterpriseModel.ts
import prisma from '../config/database';

// Função para criar uma empresa
export const createEnterprise = async (data: any) => {
  return prisma.enterprise.create({
    data,
  });
};

// Função para buscar empresa pelo CNPJ
export const findEnterpriseByCnpj = async (cnpj: string) => {
  return prisma.enterprise.findUnique({
    where: {
      deletedAt: null,
      cnpj,
    },
  });
};

// Função para buscar empresa por id
export const findEnterpriseById = async (
  id: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.enterprise.findUnique({
    where: {
      deletedAt: null,
      id,
      ...where,
    },
  });
};

export const findPublicEnterprise = async (id: string) => {
  return prisma.enterprise.findUnique({
    where: {
      id,
      deletedAt: null,
    }
  });
};

// helper para validar includes permitidos
const validIncludes = [
  'ApiKey',
  'KeywordPage',
  'users',
  'articles',
  'leads',
  'authors',
  'categories',
  'tags',
  'LeadSubmit',
  'Role',
] as const;

type IncludeOption = (typeof validIncludes)[number];

export const findEnterpriseAllDataById = async (
  id: string,
  includeParams: string[] = []
) => {
  const include: Record<string, any> = {};

  // Lista das relações que possuem deletedAt
  const relationsWithDeletedAt = ["KeywordPage", "articles", "authors"];

  includeParams.forEach((item) => {
    if (validIncludes.includes(item as IncludeOption)) {
      if (relationsWithDeletedAt.includes(item)) {
        include[item] = {
          where: { deletedAt: null },
        };
      } else {
        include[item] = true;
      }
    }
  });

  return prisma.enterprise.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include
  });
};

// Função para listar todas as empresas
export const findAllEnterprises = async () => {
  return prisma.enterprise.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      Role: true,
    },
  });
};

// Função para atualizar uma categoria
export const updateEnterprise = async (
  id: string,
  data: any
) => {
  return prisma.enterprise.update({
    where: { deletedAt: null, id },
    data,
  });
};

// Função para deletar uma categoria
export const softDeleteEnterprise = async (id: string) => {
  return prisma.enterprise.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
