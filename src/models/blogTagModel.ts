// src/models/tagModel.ts
import prisma from '../config/database';

// Função para criar uma tag
export const createTag = async (data: any) => {
  return prisma.tag.create({
    data,
  });
};

// Função para buscar tag por slug
export const findTagBySlug = async (
  slug: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.tag.findMany({
    where: {
      deletedAt: null,
      slug: {
        contains: slug,
        mode: 'insensitive',
      },
      ...where,
    },
  });
};

export const findUniqueTagBySlug = async (
  slug: string,
  enterpriseId: string
) => {
  return prisma.tag.findUnique({
    where: { slug_enterpriseId: { slug, enterpriseId } },
  });
};

// Função para buscar tag por id
export const findTagById = async (id: string) => {
  return prisma.tag.findUnique({
    where: { deletedAt: null, id },
  });
};

// Função para listar todas as tags
export const findAllTags = async (
  where?: { enterpriseId?: string },
  filter: TagFilterType = {}
) => {
  return prisma.tag.findMany({
    where: {
      deletedAt: null,
      ...where,
      ...filter,
    },
    include: {
      enterprise: true,
    },
  });
};

// Função para atualizar uma tag
export const updateTag = async (id: string, data: any) => {
  return prisma.tag.update({
    where: { deletedAt: null, id },
    data,
  });
};

// Função para deletar uma categoria
export const softDeleteTag = async (id: string) => {
  return prisma.tag.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
