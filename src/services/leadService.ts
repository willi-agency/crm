// src/services/leadSubmitService.ts
import * as LeadModel from '../models/lead/leadModel';
import { findApiKeyByKey } from '../models/apiKeyModel';
import { LeadSubmitCreateDTO } from '../types/lead/leadSubmitType';
import { ApiKeyNotFoundError } from '../utils/apiKeyApiError';
import { LeadSubmitApiError, NotPermissionDataEmpty } from '../utils/leadSubmitApiError';
import { ScopeType } from '../types/scopeType';
import { NotPermissionForAction, UndefinedEnterpriseError } from '../utils/errors/scopeError';
import { LabelFormNotFoundError } from '../utils/leadLabelFormApiError';
import { findLabelFormByName } from '../models/leadLabelFormModel';
import { uploadFileToUploadService } from '../services/uploadFileToUploadService';
import { LeadFilterType, LeadSubmitInternalCreateDTO } from '../schemas/lead/leadSchemas';
import { PaginationSchema } from '../schemas/paginationSchema.ts';
import { applyEnterpriseFilter, validateEnterpriseScope } from './authorizationService';
import { BusinessMessages } from '../constants/messages';

export const createLeadSubmitAndLeadData = async (
  data: LeadSubmitCreateDTO
) => {
  const { apiKey, dataFormId, userAgent, dataValues } = data;
  const { fileName } = dataValues as any;

  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }

  if (
    !dataValues ||
    typeof dataValues !== 'object' ||
    Object.keys(dataValues).length === 0
  ) {
    throw new NotPermissionDataEmpty();
  }

  const enterpriseId = AuthApiKeys.enterpriseId;

  try {
    // 1. Cria o LeadSubmit
    const lead = await LeadModel.createLead({
      apiKey: {
        connect: { id: AuthApiKeys.id },
      },
      dataFormId,
      enterprise: {
        connect: { id: enterpriseId },
      },
      userAgent,
    });

    // 2. Cria os LeadData baseados no JSON
    const failedFields: { field: string; error: string }[] = [];

    const leadDataArray = await Promise.all(
      Object.entries(dataValues).map(async ([labelName, value]) => {
        try {
          const label = await findLabelFormByName(labelName);
          if (!label) throw new LabelFormNotFoundError(labelName);

          let processedValue = value;

          if (
            typeof value === 'string' &&
            (value.startsWith('data:image/') || value.startsWith('data:application/pdf'))
          ) {
            processedValue = await uploadFileToUploadService(value, enterpriseId, fileName);
          }

          const leadData = await LeadModel.createDataLead({
            label: { connect: { id: label.id } },
            value: processedValue,
            leadSubmit: { connect: { id: lead.id } },
          });

          return leadData;
        } catch (err) {
          let errorMessage = 'Erro desconhecido';
          if (err instanceof Error) {
            errorMessage = err.message;
          }
          failedFields.push({ field: labelName, error: errorMessage });
          return null;
        }
      })
    );

    // Remove campos que deram erro
    const leadDataArrayFiltered = leadDataArray.filter(Boolean);

    return {
      message: 'Lead cadastrado com sucesso!',
      lead,
      leadData: leadDataArrayFiltered,
      warnings: failedFields.length
        ? {
            message: 'Alguns campos não foram processados corretamente: ',
            fields: failedFields,
          }
        : undefined,
    };
  } catch (error) {
    if (error instanceof LeadSubmitApiError) {
      throw error;
    }
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const createLeadSubmit = async (
  scope: ScopeType,
  data: LeadSubmitInternalCreateDTO
) => {
  const { enterpriseId, dataFormId, userAgent, dataValues } = data;
  const { fileName } = dataValues as any;

  validateEnterpriseScope(scope);

  if (
    !dataValues ||
    typeof dataValues !== 'object' ||
    Object.keys(dataValues).length === 0
  ) {
    throw new NotPermissionDataEmpty();
  }

  try {
    // 1. Cria o LeadSubmit
    const lead = await LeadModel.createLead({
      dataFormId,
      enterprise: {
        connect: { id: enterpriseId },
      },
      userAgent,
    });

    // 2. Cria os LeadData baseados no JSON
    const failedFields: { field: string; error: string }[] = [];

    const leadDataArray = await Promise.all(
      Object.entries(dataValues).map(async ([labelName, value]) => {
        try {
          const label = await findLabelFormByName(labelName);
          if (!label) throw new LabelFormNotFoundError(labelName);

          let processedValue = value;

          if (
            typeof value === 'string' &&
            (value.startsWith('data:image/') || value.startsWith('data:application/pdf'))
          ) {
            processedValue = await uploadFileToUploadService(value, enterpriseId, fileName);
          }

          const leadData = await LeadModel.createDataLead({
            label: { connect: { id: label.id } },
            value: processedValue,
            leadSubmit: { connect: { id: lead.id } },
          });

          return leadData;
        } catch (err) {
          let errorMessage = 'Erro desconhecido';
          if (err instanceof Error) {
            errorMessage = err.message;
          }
          failedFields.push({ field: labelName, error: errorMessage });
          return null;
        }
      })
    );

    // Remove campos que deram erro
    const leadDataArrayFiltered = leadDataArray.filter(Boolean);

    return {
      message: 'Lead cadastrado com sucesso!',
      lead,
      leadData: leadDataArrayFiltered,
      warnings: failedFields.length
        ? {
            message: 'Alguns campos não foram processados corretamente: ',
            fields: failedFields,
          }
        : undefined,
    };
  } catch (error) {
    if (error instanceof LeadSubmitApiError) {
      throw error;
    }
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllLeads = async (
  scope: ScopeType,
  filter: Partial<LeadFilterType> = {},
  pagination?: PaginationSchema
) => {
  validateEnterpriseScope(scope);
  const effectiveFilter = applyEnterpriseFilter(scope, filter);
  const leads = await LeadModel.findAllLeads(effectiveFilter, pagination);
  return {
      data: leads.data || [],
      pagination: leads.pagination,
      message: leads.data.length
        ? BusinessMessages.lead.get.ManySuccess
        : BusinessMessages.lead.get.notFound,
    };
};

export const getLeadById = async (
  id: string,
  scope: ScopeType
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const lead = await LeadModel.findLeadById(id);

    if (!lead) return null;

    // dados fixos
    const leadBase = {
      leadSubmitId: lead.id,
      enterpriseId: lead.enterpriseId,
      submittedAt: lead.submittedAt,
      userAgent: lead.userAgent,
    };

    // dados dinâmicos (achatar em info)
    const info: Record<string, any> = {};
    lead.LeadData.forEach(ld => {
      if (ld.label && ld.value) {
        info[ld.label.label] = ld.value;
      }
    });

    // busca histórico de stages do lead
    const historicStages = await LeadModel.findLeadListStageById(lead.id);

    const pipelines = historicStages.map(ps => ({
      pipelineId: ps.pipelineStage.pipelineId || null,
      pipelineName: ps.pipelineStage.name || null,
      pipelineStageId: ps.pipelineStageId,
      pipelineStageName: ps.pipelineStage.name || null,
      dateAction: ps.createdAt,
      user: ps.user ? {
        id: ps.user.id,
        name: ps.user.name,
        email: ps.user.email,
      } : null,
    }));

    // último stage = estágio atual
    const currentStage = pipelines.length ? pipelines[pipelines.length - 1] : null;

    return {
      ...leadBase,
      info,
      pipelines,
      enterprise: lead.enterprise
        ? {
            id: lead.enterprise.id,
            name: lead.enterprise.name,
          }
        : null,
      currentStage,
    };

  } catch (error) {
    if (error instanceof LeadSubmitApiError) {
      throw error;
    }
    throw new Error('Erro interno ao buscar dados do lead');
  }
};

export const getLeadsByEnterprise = async (
  recEnterpriseId: string,
  scope: ScopeType,
) => {
  const { enterpriseType, enterpriseId } = scope;
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const leadSubmits = await LeadModel.findLeadsByEnterpriseId(recEnterpriseId);

    // Mapear os leads no novo formato
    const formatted = leadSubmits.map((submit) => {
      // dados fixos
      const leadBase = {
        leadSubmitId: submit.id,
        enterpriseId: submit.enterpriseId,
        submittedAt: submit.submittedAt,
      };

      // dados dinâmicos em "info"
      const info: Record<string, any> = {};
      submit.LeadData.forEach((ld) => {
        if (ld.label && ld.value) {
          info[ld.label.label] = ld.value;
        }
      });

      return {
        ...leadBase,
        info,
      };
    });

    return formatted;
  } catch (error) {
    if (error instanceof LeadSubmitApiError) {
      throw error;
    }
    throw new Error('Erro interno ao buscar dados');
  }
};

//service kanban
export const getLeadsForKanban = async (
  recEnterpriseId: string,
  pipelineId: string,
  scope: ScopeType,
  stageId?: string,
  page: number = 1,
  limit: number = 20,
) => {
  const { enterpriseType, enterpriseId } = scope;
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  // 1. Buscar leads somente do pipeline informado
  const leads = await LeadModel.findLeadsByPipeline(recEnterpriseId, pipelineId, {
    stageId,
    skip: (page - 1) * limit,
    take: limit,
    includeNoPipeline: true,
  });

  // 2. Pega config do card
  let cardConfig = await LeadModel.findLeadCardConfig(enterpriseId);

  if (!cardConfig?.length && leads.length) {
    const allLabels = leads.flatMap(lead => lead.LeadData.map(ld => ld.label));
    const uniqueLabels = Array.from(new Map(allLabels.map(l => [l.id, l])).values());

    cardConfig = uniqueLabels.slice(0, 3).map((label, idx) => ({
      id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      enterpriseId,
      visible: true,
      contractId: null,
      fieldId: label.id,
      order: idx,
    }));
  }

  // 3. Formata leads
  const formattedLeads = leads.map(lead => {
    const info: Record<string, any> = {};

    lead.LeadData.forEach(ld => {
      if (ld.label && ld.value && cardConfig.some(c => c.fieldId === ld.labelId && c.visible)) {
        info[ld.label.name] = ld.value;
      }
    });

    return {
      leadSubmitId: lead.id,
      enterpriseId: lead.enterpriseId,
      submittedAt: lead.submittedAt,
      info,
      pipelineStageId: lead.currentPipelineStageId,
    };
  });

  // 4. Buscar detalhes do pipeline
  const pipelineDetails = await LeadModel.findPipelineDetails(pipelineId);

  return {
    leads: formattedLeads,
    pipelineDetails,
  };
};
