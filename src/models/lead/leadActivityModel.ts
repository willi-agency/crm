// src/models/leadActivityModel.ts
import { PaginationSchema } from '../../schemas/paginationSchema.ts';
import prisma from '../../config/database';
import { LeadActivityFilterType } from '../../schemas/lead/leadActivitySchemas';
import { getPaginationMeta } from '../../utils/pagination';

export const createLeadActivity = async (data: any) => {
  const { participants = [], meetingDetails, ...activityData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Cria a atividade principal
    const activity = await tx.leadActivity.create({
      data: activityData,
    });

    // 2️⃣ Cria os participantes, se houver
    if (participants.length > 0) {
      await tx.leadActivityParticipant.createMany({
        data: participants.map((p: any) => ({
          activityId: activity.id,
          userId: p.userId,
          externalEmail: p.externalEmail,
          role: p.role,
        })),
        skipDuplicates: true, // evita erro de unique caso tenha duplicidade
      });
    }

    // 3️⃣ Cria os detalhes da reunião, se houver
    if (meetingDetails) {
      await tx.leadMeetingDetails.create({
        data: {
          activityId: activity.id,
          startDate: meetingDetails.startDate,
          endDate: meetingDetails.endDate,
          meetingType: meetingDetails.meetingType,
          location: meetingDetails.location,
          addressPostalCode: meetingDetails.addressPostalCode,
          addressStreet: meetingDetails.addressStreet,
          addressNumber: meetingDetails.addressNumber,
          addressComplement: meetingDetails.addressComplement,
          addressCity: meetingDetails.addressCity,
          addressNeighborhood: meetingDetails.addressNeighborhood,
          addressCountry: meetingDetails.addressCountry,
          addressState: meetingDetails.addressState,
          link: meetingDetails.link,
        },
      });
    }

    // 4️⃣ Retorna a atividade com os relacionamentos
    return await tx.leadActivity.findUnique({
      where: { id: activity.id },
      include: {
        LeadActivityParticipant: true,
        LeadMeetingDetails: true,
      },
    });
  });
};

export const findLeadActivityById = async (id: string) => {
  return prisma.leadActivity.findUnique({
    where: { id },
    include: {
      lead: {
        select: {
          id: true,
          dataFormId: true,
          enterpriseId: true,
          currentPipelineStageId: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      }
    },
  });
};

export const findLeadActivitiesByLeadId = async (leadId: string) => {
  return prisma.leadActivity.findMany({
    where: { leadId },
    include: {
      lead: {
        select: {
          id: true,
          dataFormId: true,
          enterpriseId: true,
          currentPipelineStageId: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      LeadActivityParticipant: {
        include: {
          user: { select: { id: true, name: true, email: true } }, // usuário do participante
        },
      },
      LeadMeetingDetails: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const findAllLeadActivities = async (
  filter: LeadActivityFilterType = {},
  pagination?: PaginationSchema
) => {
  const { enterpriseId, leadId, userId, type } = filter;
  const { search, sortBy, sortOrder } = pagination || {};

  // === 1️⃣ Filtros base ===
  const filters: any = {
    ...(enterpriseId && { enterpriseId }),
    ...(leadId && { leadId }),
    ...(userId && { userId }),
    ...(type && { type }),
  };

  // === 2️⃣ Busca global (search) ===
  if (search) {
    filters.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // === 3️⃣ Contagem total ===
  const total = await prisma.leadActivity.count({ where: filters });

  // === 4️⃣ Paginação ===
  const paginationMeta = getPaginationMeta(total, pagination?.page, pagination?.perPage);

  // === 5️⃣ Ordenação segura ===
  type SortField = "title" | "type" | "createdAt" | "updatedAt" | "dueDate";
  const allowedSortFields: SortField[] = ["title", "type", "createdAt", "updatedAt", "dueDate"];

  const sortField: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : "createdAt";

  const sortDirection: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  const orderBy: Record<SortField, "asc" | "desc"> = {
    [sortField]: sortDirection,
  } as Record<SortField, "asc" | "desc">;

  // === 6️⃣ Consulta ===
  const data = await prisma.leadActivity.findMany({
    where: filters,
    include: {
      lead: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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

export const updateLeadActivity = async (id: string, data: any) => {
  return prisma.leadActivity.update({
    where: { id },
    data,
  });
};

export const findPendingActivities = async () => {
  return prisma.leadActivity.findMany({
    where: {
      type: { in: ['MEETING', 'CALL', 'TASK'] },
      doneAt: null,
      sendNotification: true,
      dueDate: { lte: new Date() },
    },
  });
};

export const findLeadPendingActivitiesByEnterpriseId = async (enterpriseId: string, userId: string) => {
  return prisma.leadActivity.findMany({
    where: {
      type: { in: ['MEETING', 'CALL', 'TASK'] },
      doneAt: null,
      dueDate: { not: null },
      lead: { enterpriseId },
      OR: [
        { userId }, // usuário criador da atividade
        { LeadActivityParticipant: { some: { userId } } }, // participante da atividade
      ],
    },
    include: {
      lead: {
        include: {
          LeadData: { include: { label: true } },  // mantém LeadData completo
          enterprise: true,                        // relação com enterprise
          currentPipelineStage: { include: { pipeline: true } }, // pipeline completo
        },
      },
      user: { select: { id: true, name: true, email: true } },  // usuário responsável

      // === novos includes agregados, sem transformação ===
      LeadActivityParticipant: {
        include: {
          user: { select: { id: true, name: true, email: true } }, // usuário do participante
        },
      },
      LeadMeetingDetails: true, // traz os detalhes da reunião
    },
    orderBy: [
    { dueDate: 'asc' },
    { createdAt: 'asc' },
  ],
  });
};

export const disableNotification = async (id: string) => {
  return prisma.leadActivity.update({
    where: { id },
    data: { sendNotification: false },
  });
};