// src/models/categoryModel.ts
import { CategoryFilterType } from '../types/categoryFilterType';
import prisma from '../config/database';

// Função para criar uma categoria
export const createCategory = async (data: any) => {
  return prisma.category.create({
    data,
  });
};

// Função para buscar categoria por slug
export const findCategoryBySlug = async (
  slug: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.category.findMany({
    where: {
      deletedAt: null,
      slug,
      ...where,
    },
  });
};

export const findUniqueCategoryBySlug = async (
  slug: string,
  enterpriseId: string
) => {
  return prisma.category.findUnique({
    where: { slug_enterpriseId: { slug, enterpriseId } },
  });
};

// Função para buscar categoria por id
export const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { deletedAt: null, id },
  });
};

// Função para listar todas as categorias
export const findAllCategories = async (
  where?: { enterpriseId?: string },
  filter: CategoryFilterType = {}
) => {
  return prisma.category.findMany({
    where: {
      deletedAt: null,
      ...where,
      ...filter,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      enterpriseId: true,
      enterprise: {
        select: {
          name: true,
        },
      },
    }
  });
};

// Função para atualizar uma categoria
export const updateCategory = async (
  id: string,
  data: any
) => {
  return prisma.category.update({
    where: { deletedAt: null, id },
    data,
  });
};

// Função para deletar uma categoria
export const softDeleteCategory = async (id: string) => {
  return prisma.category.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
