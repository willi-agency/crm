// src/models/utmSubmissionModel.ts
import { PaginationSchema } from '../../schemas/paginationSchema.ts.js';
import prisma from '../../config/database.js';
import { CheckSimilarityInput, UtmSubmissionFilterType } from '../../schemas/campaign/utmSubmissionSchemas.js';
import { getPaginationMeta } from '../../utils/pagination.js';

// === 1️⃣ Criar uma UTM Submission com seus entries ===
export const createUtmSubmission = async (data: any) => {
  return prisma.utmSubmission.create({
    data: {
      ...data,
      fields: {
        create: data.fields,
      },
    },
    include: {
      fields: true,
    },
  });
};

export const findSimilarUtmSubmissions = async (
  data: CheckSimilarityInput,
  threshold: number = 0.8,
  filter: Partial<UtmSubmissionFilterType> = {}
) => {
  // Filtragem base por enterprise e contract
  const filters: any = {
    ...(filter.enterpriseId && { enterpriseId: filter.enterpriseId }),
    ...(filter.contractId && { contractId: filter.contractId }),
  };

  // Buscar todas as submissions do enterprise/contract
  const allSubmissions = await prisma.utmSubmission.findMany({
    where: filters,
    include: { fields: true, enterprise: { select: { id: true, name: true } }, contract: { select: { id: true, name: true } } },
  });

  // Normaliza os dados recebidos para comparação
  const inputFieldsMap = Object.fromEntries(data.fields.map(f => [f.utmField, f.utmValue.toLowerCase()]));

  // Calcula similaridade para cada submission
  const similarSubmissions = allSubmissions
    .map(sub => {
      const subFieldsMap = Object.fromEntries(sub.fields.map(f => [f.utmField, f.utmValue.toLowerCase()]));

      // Contar correspondências
      const totalFields = new Set([...Object.keys(inputFieldsMap), ...Object.keys(subFieldsMap)]).size;
      const matchedFields = Object.keys(inputFieldsMap).filter(
        key => inputFieldsMap[key] && inputFieldsMap[key] === subFieldsMap[key]
      ).length;

      const similarity = totalFields ? matchedFields / totalFields : 0;
      return { ...sub, similarity };
    })
    .filter(sub => sub.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity); // ordenar do mais parecido para menos

  return similarSubmissions;
};

// === 2️⃣ Buscar uma submission por ID ===
export const findUtmSubmissionById = async (id: string) => {
  return prisma.utmSubmission.findUnique({
    where: { id },
    include: { fields: true },
  });
};

// === 3️⃣ Listar todas as submissions com filtros, search e paginação ===
export const findAllUtmSubmissions = async (
  filter: UtmSubmissionFilterType = {},
  pagination?: PaginationSchema
) => {
  const { enterpriseId, contractId, utmField, utmValue, createdById } = filter;
  const { search, sortBy, sortOrder, page = 1, perPage = 20 } = pagination || {};

  // === filtros base ===
  const filters: any = {
    ...(enterpriseId && { enterpriseId }),
    ...(contractId && { contractId }),
    ...(createdById && { createdById }),
  };

  // === busca por entries (utmField / utmValue) ===
  if (utmField || utmValue) {
    filters.fields = {
      some: {
        ...(utmField && { utmField: { contains: utmField, mode: "insensitive" } }),
        ...(utmValue && { utmValue: { contains: utmValue, mode: "insensitive" } }),
      },
    };
  }

  // === busca global (search) ===
  if (search) {
    filters.OR = [
      { baseUrl: { contains: search, mode: "insensitive" } },
      { fields: { some: { utmValue: { contains: search, mode: "insensitive" } } } },
    ];
  }

  // === contagem total ===
  const total = await prisma.utmSubmission.count({ where: filters });

  // === paginação ===
  const paginationMeta = getPaginationMeta(total, page, perPage);

  // === ordenação segura ===
  type SortField = "createdAt" | "updatedAt" | "baseUrl";
  const allowedSortFields: SortField[] = ["createdAt", "updatedAt", "baseUrl"];
  const safeSortField: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : "createdAt";
  const safeSortDirection: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  // === consulta ===
  const data = await prisma.utmSubmission.findMany({
    where: filters,
    include: { fields: true, enterprise: { select: { id: true, name: true } }, contract: { select: { id: true, name: true } } },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
    orderBy: { [safeSortField]: safeSortDirection },
  });

  // === retorno padronizado ===
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

// === 4️⃣ Atualizar uma submission ===
export const updateUtmSubmission = async (id: string, data: any) => {
  return prisma.utmSubmission.update({
    where: { id },
    data: {
      ...data,
      fields: data.fields ? { deleteMany: {}, create: data.fields } : undefined,
    },
    include: { fields: true },
  });
};