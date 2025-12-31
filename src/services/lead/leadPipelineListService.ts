//src\services\leadPipelineListService.ts
import * as pipelineErrors from '../../utils/errors/leadPipelineListApiError';
import * as LeadsPipelinesStagesModel from '../../models/lead/leadPipelineListModel';
import { findLeadPipelineStageById } from '../../models/lead/leadPipelineStageModel';
import { ScopeType } from '../../types/scopeType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../../utils/errors/scopeError';
import { LeadPipelineListCreateDTO } from '../../types/lead/leadPipelineListType';
import { LeadPipelineStageNotFoundError } from '../../utils/errors/leadPipelineStageApiError';
import { updateLead } from '../../models/lead/leadModel';

export const createLeadPipelineList = async (
  data: LeadPipelineListCreateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId, id } = scope;
  const { leadId, pipelineStageId } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca a Pipeline Stage existente
  const existingLeadStage = await findLeadPipelineStageById(pipelineStageId);
  if (!existingLeadStage) {
    throw new LeadPipelineStageNotFoundError();
  }

  // Verifica se o usuário tem permissão
  if (enterpriseType === 'STANDARD' && existingLeadStage?.pipeline.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  // Monta dinamicamente o objeto de dados
  const dataToCreate: any = {
    lead: {
      connect: {id: leadId}
    },
    pipelineStage: {
      connect: { id: pipelineStageId },
    },
    user: {
      connect: {id: id}
    }
  };

  const dataToUpdateLead: any = {
    currentPipelineStage: {
      connect: { id: pipelineStageId },
    },
  };

  // Faz a criação
  try {
    const leadPipelineList = await LeadsPipelinesStagesModel.createLeadPipelineList(dataToCreate);
    const attCurrentPipeline = await updateLead(leadId, dataToUpdateLead);

    return {
      message: 'Estágio do lead alterado',
      leadPipelineList,
      attCurrentPipeline,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof pipelineErrors.LeadPipelineListApiError) {
      throw error;
    }
    throw new Error('Erro interno ao cadastrar');
  }
};
