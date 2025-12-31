// src/models/keywordPageModel.ts
import { KeywordPageFilterType } from '../types/keywordPageFilterType';
import prisma from '../config/database';

// Função para criar uma categoria
export const createKeywordPage = async (
  data: any
) => {
  return prisma.keywordPage.create({
    data,
  });
};

// Função para buscar categoria por slug
export const findKeywordPageBySlug = async (
  slug: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.keywordPage.findMany({
    where: {
      deletedAt: null,
      slug,
      ...where,
    },
  });
};

// Função para buscar categoria por id
export const findKeywordPageById = async (id: string) => {
  return prisma.keywordPage.findUnique({
    where: { deletedAt: null, id },
  });
};

// Função para buscar categoria por id
export const findKeywordPageByEnterpriseId = async (id: string) => {
  return prisma.keywordPage.findMany({
    where: { deletedAt: null, enterpriseId: id },
    include: {
      keywordPageCategory: {
        select: {
          name: true
        }
      }
    }
  });
};

// Função para listar todas as categorias
export const findAllKeywordPages = async (
  where?: { enterpriseId?: string },
  filter: KeywordPageFilterType = {}
) => {
  return prisma.keywordPage.findMany({
    where: {
      deletedAt: null,
      ...where,
      ...filter,
    },
  });
};

// Função para listar todas as categorias
export const findPublicAllKeywordPages = async (enterpriseId: string, contractId?: string) => {
  return prisma.keywordPage.findMany({
    where: {
      deletedAt: null,
      slug: {
        not: null,
        notIn: [''],
      },
      enterpriseId,
      contractId: contractId ?? null,
    },
  });
};

export const findPublicKeywordPage = async (
  enterpriseId: string,
  slug: string
) => {
  return prisma.keywordPage.findUnique({
    where: {
      deletedAt: null,
      slug: {
        not: null,
        notIn: [''],
      },
      slug_enterpriseId: {
        slug,
        enterpriseId,
      },
    },
  });
};

// Função para atualizar uma categoria
export const updateKeywordPage = async (
  id: string,
  data: any
) => {
  return prisma.keywordPage.update({
    where: { deletedAt: null, id },
    data,
  });
};

// Função para deletar uma categoria
export const softDeleteKeywordPage = async (id: string) => {
  return prisma.keywordPage.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
