// src/models/taxonomyModel.ts
import { PaginationSchema } from '../../schemas/paginationSchema.ts';
import prisma from '../../config/database';
import { FindTaxonomyFilter } from '../../schemas/blog/taxonomySchemas';
import { getPaginationMeta } from '../../utils/pagination';

// --- CREATE ---
export const createTaxonomy = async (data: any) => {
  return prisma.taxonomy.create({
    data,
  });
};

// --- FIND BY ID ---
export const findTaxonomyById = async (id: string) => {
  return prisma.taxonomy.findUnique({
    where: { id },
    include: {
      enterprise: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
    },
  });
};

// --- FIND BY ID ---
export const findUniqueTaxonomyBySlug = async (slug: string, type: 'category' | 'tag' | 'collection', enterpriseId: string) => {
  return prisma.taxonomy.findUnique({
    where: { 
      slug_enterpriseId_type: {
        slug,
        enterpriseId,
        type
      } 
    },
    include: {
      enterprise: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
    },
  });
};

// --- FIND ALL WITH FILTER & PAGINATION ---
export const findAllTaxonomies = async (
  filter: FindTaxonomyFilter = {},
  pagination?: PaginationSchema
) => {
  const { enterpriseId, contractId, type, name } = filter;
  const { search, sortBy, sortOrder } = pagination || {};

  // === 1️⃣ Filtros base ===
  const filters: any = {
    deletedAt: null,
    ...(enterpriseId && { enterpriseId }),
    ...(contractId && { contractId }),
    ...(type && { type }),
  };

  // === 2️⃣ Busca global (search) ===
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  } else if (name) {
    filters.name = { contains: name, mode: 'insensitive' };
  }

  // === 3️⃣ Contagem total ===
  const total = await prisma.taxonomy.count({ where: filters });

  // === 4️⃣ Paginação ===
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // === 5️⃣ Ordenação segura ===
  type SortField = 'name';
  const allowedSortFields: SortField[] = ['name'];

  const sortField: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : 'name';

  const sortDirection: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

  const orderBy: Record<SortField, 'asc' | 'desc'> = {
    [sortField]: sortDirection,
  } as Record<SortField, 'asc' | 'desc'>;

  // === 6️⃣ Consulta ===
  const data = await prisma.taxonomy.findMany({
    where: filters,
    include: {
      enterprise: { select: { id: true, name: true } },
      contract: { select: { id: true, name: true } },
    },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
    orderBy,
  });

  // === 7️⃣ Retorno padronizado ===
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

// --- UPDATE ---
export const updateTaxonomy = async (id: string, data: any) => {
  return prisma.taxonomy.update({
    where: { id },
    data,
  });
};

// --- SOFT DELETE ---
export const softDeleteTaxonomy = async (id: string) => {
  return prisma.taxonomy.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
