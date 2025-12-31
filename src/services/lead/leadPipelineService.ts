//src\services\leadPipelineConfigService.ts
import * as pipelineErrors from '../../utils/errors/leadPipelineApiError';
import * as LeadsPipelinesModel from '../../models/lead/leadPipelineModel';
import { ScopeType } from '../../types/scopeType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../../utils/errors/scopeError';
import { PaginationParams } from '../../utils/pagination';
import { LeadPipelineCreateDTO, LeadPipelineFilterType, LeadPipelineUpdateDTO } from '../../types/lead/leadPipelineType';

export const createLeadPipeline = async (
  data: LeadPipelineCreateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, description, enterpriseId: recEnterpriseId } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verifica se o usuário tem permissão
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  // Monta dinamicamente o objeto de dados
  const dataToCreate: any = {
    name,
    description,
    enterprise: {
      connect: { id: recEnterpriseId },
    },
  };

  // Faz a criação
  try {
    const LeadPipeline = await LeadsPipelinesModel.createLeadPipeline(dataToCreate);

    return {
      message: 'Pipeline cadastrada com sucesso!',
      LeadPipeline,
    };
  } catch (error) {
    if (error instanceof pipelineErrors.LeadPipelineApiError) {
      throw error;
    }
    throw new Error('Erro interno ao cadastrar');
  }
};

export const getAllLeadsPipelines = async (
  scope: ScopeType,
  filter: LeadPipelineFilterType = {},
  pagination?: PaginationParams
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const leadPipelines = await LeadsPipelinesModel.findAllLeadPipelines(where, filter, pagination);
    return leadPipelines || [];
  } catch (error) {
    if (error instanceof pipelineErrors.LeadPipelineApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao consultar');
  }
};

export const getAllLeadPipelinesByEnterprise = async (
  enterpriseId: string,
  scope: ScopeType,
  filter: LeadPipelineFilterType = {},
  pagination?: PaginationParams
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Se STANDARD, só pode acessar a própria empresa
  if (scope.enterpriseType === 'STANDARD' && scope.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const where = { enterpriseId };
    const leadPipelines = await LeadsPipelinesModel.findAllLeadPipelines(where, filter, pagination);
    return leadPipelines || [];
  } catch (error) {
    if (error instanceof pipelineErrors.LeadPipelineApiError) throw error;
    throw new Error('Erro interno ao consultar pipelines da empresa');
  }
};

export const updateLeadPipeline = async (
  id: string,
  data: LeadPipelineUpdateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca a Pipeline existente
  const existingLeadPipeline = await LeadsPipelinesModel.findLeadPipelineById(id);
  if (!existingLeadPipeline) {
    throw new pipelineErrors.LeadPipelineNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (
    enterpriseType === 'STANDARD' &&
    existingLeadPipeline.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  // 4. Atualiza
  try {
    const result = await LeadsPipelinesModel.updateLeadPipeline(id, data);

    if (!result) {
      throw new Error('Erro ao tentar atualizar a Pipeline');
    }

    return result;
  } catch (error) {
    if (error instanceof pipelineErrors.LeadPipelineApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao atualizar pipeline');
  }
};
