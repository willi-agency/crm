// src/models/articleModel.ts
import { ArticleFilterType } from '../types/articleFilterType';
import prisma from '../config/database';

// Função para criar uma article
export const createArticle = async (data: any) => {
  return prisma.article.create({
    data,
  });
};

// Função para buscar article por Slug
export const findArticleBySlug = async (
  slug: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.article.findMany({
    where: {
      deletedAt: null,
      slug,
      ...where,
    },
    include: {
      tags: true,
    },
  });
};

// Função para buscar artigo por id
export const findArticleById = async (id: string) => {
  return prisma.article.findUnique({
    where: {
      deletedAt: null,
      id,
    },
    include: {
      tags: true,
    },
  });
};

export const findAllArticles = async (
  where?: { enterpriseId?: string },
  filter: ArticleFilterType = {}
) => {
  return prisma.article.findMany({
    where: {
      deletedAt: null,
      ...where,
      ...filter,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      image: true,
      status: true,
      enterpriseId: true,
      datePublished: true,
      createdAt: true,
      updatedAt: true,
      // Exclui content e rawContent por omissão (não os incluindo)

      tags: {
        select: {
          name: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      enterprise: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const findArticleCreationData = async (enterpriseId: string) => {
  const [authors, categories, tags, contracts] = await Promise.all([
    // Buscar autores da empresa
    prisma.author.findMany({
      where: {
        deletedAt: null,
        enterpriseId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'desc',
      },
    }),
    
    // Buscar categorias da empresa
    prisma.category.findMany({
      where: {
        deletedAt: null,
        enterpriseId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'desc',
      },
    }),
    
    // Buscar tags da empresa
    prisma.tag.findMany({
      where: {
        deletedAt: null,
        enterpriseId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'desc',
      },
    }),

    // Buscar tags da empresa
    prisma.contract.findMany({
      where: {
        deletedAt: null,
        enterpriseId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'desc',
      },
    }),
  ]);

  return {
    authors,
    categories,
    tags,
    contracts,
  };
};

export const findPublicAllArticles = async (enterpriseId: string, contractId?: string) => {
  return prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      enterpriseId,
      contractId: contractId ?? null
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      image: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findPublicArticle = async (slug: string, enterpriseId: string) => {
  return prisma.article.findFirst({
    where: { slug, enterpriseId },
    include: {
      tags: true,
      author: true,
      category: true,
    },
  });
};

// Função para atualizar uma article
export const updateArticle = async (
  id: string,
  data: any
) => {
  return prisma.article.update({
    where: {
      deletedAt: null,
      id,
    },
    data,
    include: {
      tags: true,
    }
  });
};

// Função para deletar uma categoria
export const softDeleteArticle = async (id: string) => {
  return prisma.article.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
