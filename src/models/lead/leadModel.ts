// src/models/leadModel.ts
import prisma from '../../config/database';
import { getPaginationMeta } from '../../utils/pagination';
import { PaginationSchema } from '../../schemas/paginationSchema.ts';
import { LeadFilterType } from '../../schemas/lead/leadSchemas';

interface FindLeadsOptions {
  skip?: number;
  take?: number;
  stageId?: string;
  includeNoPipeline?: boolean;
}

export const createLead = async (data: any) => {
  return prisma.leadSubmit.create({
    data,
  });
};

export const createDataLead = async (data: any) => {
  return prisma.leadData.create({
    data,
  });
};

export const findAllLeads = async (
  filter: LeadFilterType = {},
  pagination?: PaginationSchema
) => {
  const { enterpriseId, dataFormId, contractId, currentPipelineStageId } = filter;
  const { search, sortBy, sortOrder } = pagination || {};

  // Filtros base do LeadSubmit
  const filters: any = {
    ...(enterpriseId && { enterpriseId }),
    ...(dataFormId && { dataFormId }),
    ...(contractId && { contractId }),
    ...(currentPipelineStageId && { currentPipelineStageId }),
  };

  // Busca global (search) nos campos dinâmicos
  if (search) {
    filters.LeadData = {
      some: {
        value: { contains: search, mode: "insensitive" },
      },
    };
  }

  const total = await prisma.leadSubmit.count({ where: filters });

  // === 4️⃣ Paginação ===
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // 5️⃣ Ordenação segura
  type SortField = "submittedAt" | "createdAt";
  const allowedSortFields: SortField[] = ["submittedAt", "createdAt"];

  const sortField: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : "submittedAt";

  const sortDirection: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Record<SortField, "asc" | "desc"> = {
    [sortField]: sortDirection,
  } as Record<SortField, "asc" | "desc">;

  // 6️⃣ Consulta
  const data = await prisma.leadSubmit.findMany({
    where: filters,
    include: {
      LeadData: { include: { label: true } },
      enterprise: {
        select: {
          id: true,
          name: true,
        },
      },
      currentPipelineStage: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    skip: paginationMeta.skip,
    take: paginationMeta.perPage,
    orderBy,
  });

  // 7️⃣ Retorno padronizado
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

export const findLeadById = async (id: string) => {
  return prisma.leadSubmit.findUnique({
    where: { id },
    include: {
      LeadData: {
        include: { label: true },
      },
      enterprise: {
        select: {
          id: true,
          name: true,
        },
      },
      currentPipelineStage: {
        include: {
          pipeline: true,
        },
      },
    },
  });
};

export const findLeadListStageById = async (leadId: string) => {
  return prisma.leadPipelineList.findMany({
    where: { leadId },
    include: {
      pipelineStage: {
        include: {
          pipeline: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });
};

export const findLeadsByEnterpriseId = async (enterpriseId: string) => {
  return prisma.leadSubmit.findMany({
    where: { enterpriseId },
    include: {
      LeadData: {
        include: { label: true },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });
};

export const findLeadSubmitsWithFilter = async (
  enterpriseId: string,
  filters: Record<string, string> = {},
  page = 1,
  pageSize = 10
) => {
  const offset = (page - 1) * pageSize;

  // Gera as condições de filtro para LeadData
  const leadDataFilters = Object.entries(filters).map(([key, value]) => ({
    label: {
      name: key, // Nome do label para filtrar
    },
    value: value, // Valor que queremos filtrar
  }));

  // Monta o filtro para o LeadSubmit
  const where = {
    enterpriseId,
    ...(leadDataFilters.length > 0 && {
      LeadData: {
        some: {
          AND: leadDataFilters, // 'some' para buscar qualquer LeadData que satisfaça as condições
        },
      },
    }),
  };

  // Realiza a consulta no banco
  const leadSubmits = await prisma.leadSubmit.findMany({
    where,
    skip: offset,
    take: pageSize,
    include: {
      LeadData: {
        include: {
          label: true, // Inclui a tabela LabelForm dentro de LeadData
        },
      },
      apiKey: true,
      LeadContactList: true,
      MessageDelivery: true,
    },
    orderBy: {
      submittedAt: 'desc',
    },
  });

  return leadSubmits;
};

//model kanban
export const findLeadCardConfig = async (enterpriseId: string) => {
  const config = await prisma.leadCardConfig.findMany({
    where: { enterpriseId, visible: true },
    orderBy: { order: 'asc' },
  });

  return config;
};

// Buscar leads já filtrando pelo pipeline
export const findLeadsByPipeline = async (
  enterpriseId: string,
  pipelineId: string,
  options: FindLeadsOptions = {}
) => {
  const { skip = 0, take = 20, stageId, includeNoPipeline = false } = options;

  return prisma.leadSubmit.findMany({
    where: {
      enterpriseId,
      AND: [
        pipelineId
          ? includeNoPipeline
            ? {
                OR: [
                  { currentPipelineStage: { pipelineId } }, // leads que pertencem ao pipeline
                  { currentPipelineStageId: null },         // leads sem pipeline
                ],
              }
            : { currentPipelineStage: { pipelineId } }      // só leads do pipeline
          : {},
        stageId ? { currentPipelineStageId: stageId } : {}, // filtro opcional de estágio
      ],
    },
    skip,
    take,
    include: {
      LeadData: { include: { label: true } },
      currentPipelineStage: {
        include: { pipeline: true },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });
};

// Buscar pipeline + stages
export const findPipelineDetails = async (pipelineId: string) => {
  const pipeline = await prisma.leadPipeline.findUnique({
    where: { id: pipelineId },
    include: {
      stages: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          order: true,
        },
      },
    },
  });

  if (!pipeline) return null;

  return {
    pipelineId: pipeline.id,
    pipelineName: pipeline.name,
    stages: pipeline.stages.map(s => ({
      pipelineStageId: s.id,
      pipelineStageName: s.name,
      pipelineStageOrder: s.order,
    })),
  };
};

export const updateLead = async (
  id: string,
  data: any
) => {
  return prisma.leadSubmit.update({
    where: { id },
    data,
  });
};
