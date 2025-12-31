// src/services/apiKeyService.ts
import { ScopeType } from '../types/scopeType';
import * as ApiKeyModel from '../models/apiKeyModel';
import {
  ApiKeyAlreadyDeletedError,
  ApiKeyNotFoundError,
  ApiKeyApiError,
} from '../utils/apiKeyApiError';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';
import { generateRandomApiKey } from '../utils/apiKeyGenerator';
import { ApiKeyFilterType } from '../types/apiKeyFilterType';
import { CreateApiKeyDTO } from '../schemas/apiKeySchemas';

export const createApiKey = async (data: CreateApiKeyDTO, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;
  const { description, enterpriseId: recEnterpriseId, contractId } = data;

  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  let newApiKey;
  let createdApiKey;

  while (true) {
    try {
      // Gerar chave aleatória
      newApiKey = generateRandomApiKey();

      // Tenta criar
      createdApiKey = await ApiKeyModel.createApiKey({
        key: newApiKey,
        description,
        enterprise: {
          connect: { id: recEnterpriseId },
        },
        contract: contractId ? { connect: { id: contractId } } : undefined,
      });

      break; // se deu certo, sai do loop
    } catch (error: any) {
      if (error?.code === 'P2002') {
        // P2002 = Unique constraint failed
        console.warn(`Chave duplicada: ${newApiKey}, tentando novamente...`);
        continue;
      } else {
        if (error instanceof ApiKeyApiError) {
          throw error;
        }
        // Senão, lança erro genérico
        throw new Error('Erro interno ao criar o lead e os dados');
      }
    }
  }

  return {
    message: 'apiKey cadastrada com sucesso!',
    apiKey: createdApiKey,
  };
};

export const getAllApiKeys = async (
  scope: ScopeType,
  filter: ApiKeyFilterType = {}
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const apiKeys = await ApiKeyModel.findAllApiKeys(where, filter);
    return apiKeys || [];
  } catch (error) {
    throw new Error('Erro ao buscar as apiKeys');
  }
};

export const getApiKeyByKey = async (key: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const apiKeys = await ApiKeyModel.findApiKeyByKey(key, where);

    if (!apiKeys) {
      return 'Nenhuma apiKey existente';
    }

    return apiKeys;
  } catch (error) {
    if (error instanceof ApiKeyNotFoundError) {
      throw error;
    }
    throw new Error('Erro ao buscar a apiKey');
  }
};

export const deleteApiKey = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a apiKey existe antes de tentar deletá-la
  const apiKey = await ApiKeyModel.findApiKeyById(id);

  if (!apiKey) {
    throw new ApiKeyNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar
  if (enterpriseType === 'STANDARD' && apiKey?.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (apiKey.revoked !== false) {
    throw new ApiKeyAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await ApiKeyModel.softDeleteApiKey(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a apiKey');
    }

    return result;
  } catch (error) {
    // Tratando qualquer erro inesperado na camada de modelo
    throw new Error('Erro ao deletar apiKey');
  }
};
