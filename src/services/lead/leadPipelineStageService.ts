//src\services\leadPipelineConfigService.ts
import * as pipelineErrors from '../../utils/errors/leadPipelineStageApiError';
import * as LeadsPipelinesStagesModel from '../../models/lead/leadPipelineStageModel';
import { findLeadPipelineById } from '../../models/lead/leadPipelineModel';
import { ScopeType } from '../../types/scopeType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../../utils/errors/scopeError';
import { PaginationParams } from '../../utils/pagination';
import { LeadPipelineNotFoundError } from '../../utils/errors/leadPipelineApiError';
import { LeadPipelineStageCreateDTO, LeadPipelineStageFilterType, LeadPipelineStagesUpdateDTO } from '../../types/lead/leadPipelineStageType';

export const createLeadPipelineStage = async (
  data: LeadPipelineStageCreateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, order, pipelineId } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca a Pipeline existente
  const existingLeadPipeline = await findLeadPipelineById(pipelineId);
  if (!existingLeadPipeline) {
    throw new LeadPipelineNotFoundError();
  }

  // Verifica se o usuário tem permissão
  if (enterpriseType === 'STANDARD' && existingLeadPipeline?.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  // Monta dinamicamente o objeto de dados
  const dataToCreate: any = {
    name,
    order,
    pipeline: {
      connect: { id: pipelineId },
    },
  };

  // Faz a criação
  try {
    const LeadPipeline = await LeadsPipelinesStagesModel.createLeadPipelineStage(dataToCreate);

    return {
      message: 'Coluna da pipeline cadastrada com sucesso!',
      LeadPipeline,
    };
  } catch (error) {
    if (error instanceof pipelineErrors.LeadPipelineStageApiError) {
      throw error;
    }
    throw new Error('Erro interno ao cadastrar');
  }
};

export const getAllLeadsPipelinesStagesByPipelineId = async (
  pipelineId: string,
  scope: ScopeType,
  filter: LeadPipelineStageFilterType = {},
  pagination?: PaginationParams
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca a Pipeline existente
  const existingLeadPipeline = await findLeadPipelineById(pipelineId);
  if (!existingLeadPipeline) {
    throw new LeadPipelineNotFoundError();
  }

  // Se STANDARD, só pode acessar a própria empresa
  if (scope.enterpriseType === 'STANDARD' && scope.enterpriseId !== existingLeadPipeline.enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const where = { pipelineId };
    const leadPipelines = await LeadsPipelinesStagesModel.findAllLeadPipelineStages(where, filter, pagination);
    return leadPipelines || [];
  } catch (error) {
    console.log(error);
    if (error instanceof pipelineErrors.LeadPipelineStageApiError) throw error;
    throw new Error('Erro interno ao consultar colunas da pipeline da empresa');
  }
};

export const updateLeadPipelineStages = async (
  pipelineId: string,
  data: LeadPipelineStagesUpdateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;

  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Valida a pipeline
  const existingPipeline = await findLeadPipelineById(pipelineId);
  if (!existingPipeline) {
    throw new LeadPipelineNotFoundError();
  }

  // 2. Verifica permissão
  if (
    enterpriseType === 'STANDARD' &&
    existingPipeline.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  // 3. Atualiza todos os stages em paralelo
  try {
    const results = await Promise.all(
      data.map(stage =>
        LeadsPipelinesStagesModel.updateLeadPipelineStage(stage.id, {
          order: stage.order,
          name: stage.name,
        })
      )
    );

    return results;
  } catch (error) {
    if (error instanceof pipelineErrors.LeadPipelineStageApiError) {
      throw error;
    }
    throw new Error('Erro interno ao atualizar colunas da pipeline');
  }
};
