import prisma from '../../config/database';
import { getPaginationMeta } from '../../utils/pagination';
import { BlogArticleFilterType, BlogHomeQueryType } from '../../schemas/blog/blogArticleSchemas';
import { PaginationSchema } from '../../schemas/paginationSchema.ts';

// =======================================================
// 🧩 CREATE
// =======================================================
export const createArticle = async (data: any) => {
  return prisma.article.create({ data });
};

// Cria relações entre um artigo e múltiplas taxonomias
export const createRelationArticleTaxonomies = async (
  articleId: string,
  taxonomyIds: string[]
) => {
  if (!taxonomyIds?.length) return;

  const data = taxonomyIds.map((taxonomyId) => ({
    articleId,
    taxonomyId,
  }));

  await prisma.articleTaxonomy.createMany({
    data,
    skipDuplicates: true,
  });
};

// =======================================================
// 🧩 FIND BY SLUG
// =======================================================
export const findArticleBySlug = async (slug: string, enterpriseId?: string) => {
  const article = await prisma.article.findFirst({
    where: { deletedAt: null, slug, enterpriseId },
    include: {
      author: true,
      enterprise: true,
      contract: true,
      ArticleTaxonomy: {
        select: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              metaTitle: true,
              metaDescription: true,
              thumb: true,
            },
          },
        },
      },
    },
  });

  // 🔁 Converte ArticleTaxonomy → taxonomies
  if (!article) return null;
  return {
    ...article,
    taxonomies: article.ArticleTaxonomy.map((at) => at.taxonomy),
  };
};

// =======================================================
// 🧩 FIND BY ID
// =======================================================
export const findArticleById = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { deletedAt: null, id },
    include: {
      author: true,
      enterprise: true,
      contract: true,
      ArticleTaxonomy: {
        select: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              metaTitle: true,
              metaDescription: true,
              thumb: true,
            },
          },
        },
      },
    },
  });

  if (!article) return null;
  return {
    ...article,
    taxonomies: article.ArticleTaxonomy.map((at) => at.taxonomy),
  };
};

// =======================================================
// 🧩 FIND ALL (ADMIN)
// =======================================================
export const findAllArticles = async (
  filter: Partial<BlogArticleFilterType> = {},
  pagination?: PaginationSchema
) => {
  const { status, recommended, enterpriseId, contractId, authorId, taxonomyId } = filter;
  const { search, sortBy, sortOrder } = pagination || {};

  // === 1️⃣ Filtros base ===
  const filters: any = {
    deletedAt: null,
    ...(status && { status }),
    ...(recommended && { recommended }),
    ...(enterpriseId && { enterpriseId }),
    ...(contractId && { contractId }),
    ...(authorId && { authorId }),
    ...(taxonomyId && {
      ArticleTaxonomy: { some: { taxonomyId } },
    }),
  };

  // === 2️⃣ Busca global ===
  if (search) {
    filters.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // === 3️⃣ Contagem total ===
  const total = await prisma.article.count({ where: filters });
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // === 4️⃣ Ordenação ===
  const allowedSortFields = ["createdAt", "updatedAt", "title", "datePublished"] as const;
  type SortField = (typeof allowedSortFields)[number];

  const sortField: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : "createdAt";

  const sortDirection: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  // === 5️⃣ Consulta ===
  const data = await prisma.article.findMany({
    where: filters,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      image: true,
      status: true,
      recommended: true,
      enterpriseId: true,
      contractId: true,
      datePublished: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true } },
      enterprise: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
      ArticleTaxonomy: {
        select: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              metaTitle: true,
              metaDescription: true,
              thumb: true,
            },
          },
        },
      },
    },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
    orderBy: { [sortField]: sortDirection },
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

// =======================================================
// 🧩 PUBLIC: ALL ARTICLES
// =======================================================
export const findPublicAllArticles = async (
  enterpriseId: string,
  contractId?: string,
  filter: Partial<BlogArticleFilterType> = {},
  pagination?: PaginationSchema
) => {
  const { recommended, taxonomyId, authorId } = filter;
  const { search, sortBy, sortOrder } = pagination || {};

  const filters: any = {
    deletedAt: null,
    status: 'PUBLISHED',
    enterpriseId,
    ...(contractId && { contractId }),
    ...(recommended && { recommended }),
    ...(authorId && { authorId }),
    ...(taxonomyId && { ArticleTaxonomy: { some: { taxonomyId } } }),
  };

  if (search) {
    filters.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const total = await prisma.article.count({ where: filters });
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  const sortField = sortBy || "createdAt";
  const sortDirection = sortOrder === "asc" ? "asc" : "desc";

  const data = await prisma.article.findMany({
    where: filters,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      image: true,
      recommended: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, bio: true, image: true, profileUrl: true, sameAs: true } },
      ArticleTaxonomy: {
        select: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              metaTitle: true,
              metaDescription: true,
              thumb: true,
            },
          },
        },
      },
    },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
    orderBy: { [sortField]: sortDirection },
  });

  return {
    data,
    pagination: paginationMeta,
  };
};

// =======================================================
// 🧩 PUBLIC: FIND BY SLUG
// =======================================================
export const findPublicArticle = async (slug: string, enterpriseId: string) => {
  const article = await prisma.article.findFirst({
    where: { slug, enterpriseId },
    include: {
      author: true,
      ArticleTaxonomy: {
        select: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              metaTitle: true,
              metaDescription: true,
              thumb: true,
            },
          },
        },
      },
    },
  });

  if (!article) return null;
  return {
    ...article,
    taxonomies: article.ArticleTaxonomy.map((at) => at.taxonomy),
  };
};

// =======================================================
// 🧩 UPDATE / DELETE
// =======================================================
export const updateArticle = async (id: string, data: any) => {
  return prisma.article.update({
    where: { deletedAt: null, id },
    data,
    include: {
      ArticleTaxonomy: {
        select: { taxonomy: true },
      },
    },
  });
};

// Remove todas as relações de taxonomias do artigo
export const deleteArticleTaxonomies = async (articleId: string) => {
  return prisma.articleTaxonomy.deleteMany({
    where: { articleId },
  });
};

export const softDeleteArticle = async (id: string) => {
  return prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

// --------------------------------------------------
// findArticleCreationData (retorna authors, categories, tags)
// --------------------------------------------------
export const findArticleCreationData = async (enterpriseId: string) => {
  const [contracts, authors, categories, tags, collections] = await Promise.all([
    prisma.contract.findMany({
      where: {
        deletedAt: null,
        enterpriseId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'desc' },
    }),
    prisma.author.findMany({
      where: { enterpriseId },
      select: { id: true, name: true },
      orderBy: { name: 'desc' },
    }),
    prisma.taxonomy.findMany({
      where: {
        enterpriseId,
        type: "category",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: { name: 'desc' },
    }),
    prisma.taxonomy.findMany({
      where: {
        enterpriseId,
        type: "tag",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'desc' },
    }),
    prisma.taxonomy.findMany({
      where: {
        enterpriseId,
        type: "collection",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'desc' },
    }),
  ]);

  return { contracts, authors, categories, tags, collections };
};

// --------------------------------------------------
// findPublicBlogHome (preserva a API: options, pagination, keys)
// --------------------------------------------------
export const findTags = async (enterpriseId: string, contractId?: string) => {
  return prisma.taxonomy.findMany({
    where: { deletedAt: null, enterpriseId, ...(contractId ? { contractId } : {}), type: 'tag' },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });
};

export const findCategories = async (enterpriseId: string, contractId?: string) => {
  return prisma.taxonomy.findMany({
    where: { deletedAt: null, enterpriseId, ...(contractId ? { contractId } : {}), type: 'category' },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });
};

export const findCollections = async (enterpriseId: string, contractId?: string) => {
  return prisma.taxonomy.findMany({
    where: { deletedAt: null, enterpriseId, ...(contractId ? { contractId } : {}), type: 'collection' },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });
};

export const findAuthors = async (enterpriseId: string) => {
  return prisma.author.findMany({
    where: { deletedAt: null, enterpriseId },
    select: { id: true, name: true, bio: true, image: true, profileUrl: true, sameAs: true },
    orderBy: { name: 'asc' },
  });
};

export const findCollectionsBySlugs = async (
  enterpriseId: string,
  slugs?: string[],
  contractId?: string
) => {
  const where: any = {
    deletedAt: null,
    enterpriseId,
    type: "collection",
    ...(contractId ? { contractId } : {}),
  };

  if (slugs && slugs.length > 0) {
    where.slug = { in: slugs };
  }

  return prisma.taxonomy.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      thumb: true,
    },
    orderBy: { name: "asc" },
  });
};

export const findArticlesByCollectionSlug = async (
  enterpriseId: string,
  slug: string,
  contractId?: string
) => {
  return prisma.article.findMany({
    where: {
      deletedAt: null,
      enterpriseId,
      status: "PUBLISHED",
      ...(contractId ? { contractId } : {}),
      ArticleTaxonomy: {
        some: {
          taxonomy: {
            slug,
            type: "collection",
            deletedAt: null,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      image: true,
      recommended: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, bio: true, image: true, profileUrl: true, sameAs: true } },
      ArticleTaxonomy: {
        select: {
          taxonomy: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              metaTitle: true,
              metaDescription: true,
              thumb: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
