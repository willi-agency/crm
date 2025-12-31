import * as leadLabelForm from '../models/leadLabelFormModel';
import { LabelFormCreateDTO } from '../types/lead/leadSubmitType';
import { ScopeType } from '../types/scopeType';
import {
  NotPermissionForAction,
  UndefinedEnterpriseError,
} from '../utils/errors/scopeError';
import {
  LabelFormNotFoundError,
  LeadFormAlreadyDeletedError,
  LeadLabelFormApiError,
} from '../utils/leadLabelFormApiError';

export const createLabelForm = async (
  data: LabelFormCreateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { label, name, type, description } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para editar
  if (enterpriseType !== 'MASTER') {
    throw new NotPermissionForAction();
  }

  const existingLabel = await leadLabelForm.findLabelFormByName(name);

  if (existingLabel) {
    throw new LabelFormNotFoundError(label);
  }

  try {
    const labelForm = await leadLabelForm.createLabelForm({
      label,
      name,
      type,
      description,
    });

    return {
      message: 'Label cadastrada com sucesso!',
      labelForm,
    };
  } catch (error) {
    if (error instanceof LeadLabelFormApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllLabels = async (scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para editar
  if (enterpriseType !== 'MASTER') {
    throw new NotPermissionForAction();
  }

  try {
    const enterprises = await leadLabelForm.findAllLabels();
    return enterprises || [];
  } catch (error) {
    if (error instanceof LeadLabelFormApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getLabelFormByName = async (name: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para consultar
  if (enterpriseType !== 'MASTER') {
    throw new NotPermissionForAction();
  }

  try {
    const label = await leadLabelForm.findLabelFormByName(name);

    if (!label) {
      return 'Nenhuma label encontrada';
    }

    return label;
  } catch (error) {
    if (error instanceof LeadLabelFormApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const deleteLabelForm = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a enterprise existe antes de tentar deletá-la
  const labelForm = await leadLabelForm.findLabelFormById(id);
  if (!labelForm) {
    throw new LabelFormNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar
  if (enterpriseType !== 'MASTER') {
    throw new NotPermissionForAction();
  }

  if (labelForm.deletedAt !== null) {
    throw new LeadFormAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await leadLabelForm.softDeleteLabel(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a enterprise');
    }

    return result;
  } catch (error) {
    if (error instanceof LeadLabelFormApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};
