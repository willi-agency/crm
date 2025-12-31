// src/models/authorModel.ts
import { PaginationSchema } from '../../schemas/paginationSchema.ts';
import prisma from '../../config/database';
import { FindBlogAuthorFilter } from '../../schemas/blog/blogAuthorSchemas';
import { getPaginationMeta } from '../../utils/pagination';

// Função para criar uma autor
export const createAuthor = async (data: any) => {
  return prisma.author.create({
    data,
  });
};

// Função para buscar autor por nome
export const findAuthorByName = async (
  name: string,
  enterpriseId?: string,
) => {
  return prisma.author.findMany({
    where: {
      deletedAt: null,
      name: { contains: name, mode: 'insensitive' },
      ...(enterpriseId ? { enterpriseId } : {}),
    },
    include: {
      enterprise: {
        select: { id: true, name: true },
      },
    },
  });
};

// Função para buscar autor por id
export const findAuthorById = async (id: string) => {
  return prisma.author.findUnique({
    where: {
      deletedAt: null,
      id,
    },
  });
};

// Função para listar todas os autores
export const findAllAuthors = async (
  filter: FindBlogAuthorFilter = {},
  pagination?: PaginationSchema
) => {
  const { enterpriseId, contractId, name, bio, sameAs } = filter;
  const { search, sortBy, sortOrder } = pagination || {};

  // === 1️⃣ Filtros base ===
  const filters: any = {
    deletedAt: null,
    ...(enterpriseId && { enterpriseId }),
    ...(contractId && { contractId }),
    ...(sameAs && { sameAs: { hasSome: sameAs } }),
  };

  // === 2️⃣ Busca global (search) ===
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { bio: { contains: search, mode: "insensitive" } },
    ];
  } else {
    if (name) filters.name = { contains: name, mode: "insensitive" };
    if (bio) filters.bio = { contains: bio, mode: "insensitive" };
  }

  // === 3️⃣ Contagem total ===
  const total = await prisma.author.count({ where: filters });

  // === 4️⃣ Paginação ===
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // === 5️⃣ Ordenação segura ===
  type SortField = "name" | "bio" | "createdAt" | "updatedAt";
  const allowedSortFields: SortField[] = ["name", "bio", "createdAt", "updatedAt"];

  const sortField: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : "createdAt";

  const sortDirection: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Record<SortField, "asc" | "desc"> = {
    [sortField]: sortDirection,
  } as Record<SortField, "asc" | "desc">;

  // === 6️⃣ Consulta ===
  const data = await prisma.author.findMany({
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

// Função para atualizar um autor
export const updateAuthor = async (
  id: string,
  data: any
) => {
  return prisma.author.update({
    where: {
      deletedAt: null,
      id,
    },
    data,
  });
};

// Função para deletar um autor
export const softDeleteAuthor = async (id: string) => {
  return prisma.author.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
