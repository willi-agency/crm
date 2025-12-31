// src/services/enterpriseService.ts
import { ScopeType } from '../types/scopeType';
import * as EnterpriseModel from '../models/enterpriseModel';
import {
  CnpjAlreadyRegisteredError,
  EnterpriseAlreadyDeletedError,
  EnterpriseApiError,
  EnterpriseNotFoundError,
} from '../utils/enterpriseApiError';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';
import { uploadFileToUploadService } from './uploadFileToUploadService';
import { findApiKeyByKey } from '../models/apiKeyModel';
import { ApiKeyNotFoundError } from '../utils/apiKeyApiError';
import { EnterpriseCreateDTO, EnterpriseUpdateDTO } from '../schemas/enterpriseSchemas';

export const createEnterprise = async (
  data: EnterpriseCreateDTO,
  scope: ScopeType
) => {
  const { enterpriseType } = scope;
  const { 
    name, 
    cnpj, 
    logo, 
    webhookDeploy, 
    briefing, 
    MapCoverage, 
    addressCity, 
    addressComplement, 
    addressCountry, 
    addressNeighborhood,
    addressNumber,
    addressPostalCode,
    addressState,
    addressStreet,
    corporateReason,
    domain 
  } = data

  // Validação do escopo
  if (!enterpriseType) {
    throw new UndefinedEnterpriseError();
  }

  if (enterpriseType !== 'MASTER') {
    throw new NotPermissionForAction();
  }

  const existingCategory = await EnterpriseModel.findEnterpriseByCnpj(cnpj);

  if (existingCategory) {
    throw new CnpjAlreadyRegisteredError();
  }

  try {
    // 1. Cria a empresa SEM o logo ainda
    const enterprise = await EnterpriseModel.createEnterprise({
      name,
      cnpj,
      briefing,
      webhookDeploy,
      MapCoverage,
      addressCity, 
      addressComplement, 
      addressCountry, 
      addressNeighborhood,
      addressNumber,
      addressPostalCode,
      addressState,
      addressStreet,
      corporateReason,
      domain
    });

    let imageUrl: string | undefined;

    // 2. Se veio logo (em base64), faz upload com o ID real
    if (logo && logo.startsWith('data:image')) {
      try {
        imageUrl = await uploadFileToUploadService(logo, enterprise.id, name);

        // 3. Atualiza a empresa com a imagem
        await EnterpriseModel.updateEnterprise(enterprise.id, {
          logo: imageUrl,
        });

        // Atualiza o objeto final (opcional, para retorno)
        enterprise.logo = imageUrl;
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        throw new Error(`Erro ao fazer upload da imagem: ${error}`);
      }
    } else if (logo) {
      // Caso o logo já seja uma URL
      await EnterpriseModel.updateEnterprise(enterprise.id, {
        logo,
      });

      enterprise.logo = logo;
    }

    return {
      message: 'Empresa cadastrada com sucesso!',
      enterprise,
    };
  } catch (error) {
    if (error instanceof EnterpriseApiError) {
      throw error;
    }

    throw new Error('Erro interno ao criar a empresa');
  }
};

export const getAllEnterprises = async (scope: ScopeType) => {
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
    const enterprises = await EnterpriseModel.findAllEnterprises();
    return enterprises || [];
  } catch (error) {
    console.log(error);
    if (error instanceof EnterpriseApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getEnterpriseByCnpj = async (cnpj: string, scope: ScopeType) => {
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
    const enterprises = await EnterpriseModel.findEnterpriseByCnpj(cnpj);

    if (!enterprises) {
      return 'Nenhuma empresa encontrada';
    }

    // Se for MASTER, retorna todos os slugs com esse nome
    return enterprises;
  } catch (error) {
    if (error instanceof EnterpriseApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getEnterpriseById = async (id: string, scope: ScopeType) => {
  if (scope.enterpriseType === 'STANDARD' && id !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const enterprises = await EnterpriseModel.findEnterpriseById(id, where);

    if (!enterprises) {
      throw new EnterpriseNotFoundError();
    }

    return enterprises;
  } catch (error) {
    if (error instanceof EnterpriseApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao buscar dados');
  }
};

export const getEnterpriseAllDataById = async (
  id: string,
  params: string[],
  scope: ScopeType
) => {
  if (scope.enterpriseType === 'STANDARD' && id !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const enterprises = await EnterpriseModel.findEnterpriseAllDataById(
      id,
      params
    );

    if (!enterprises) {
      throw new EnterpriseNotFoundError();
    }
    return enterprises;
  } catch (error) {
    console.log(error);
    if (error instanceof EnterpriseApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao buscar dados');
  }
};

export const updateEnterprise = async (
  id: string,
  scope: ScopeType,
  data: EnterpriseUpdateDTO,
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { 
    name, 
    cnpj, 
    logo, 
    webhookDeploy, 
    briefing, 
    MapCoverage, 
    addressCity, 
    addressComplement, 
    addressCountry, 
    addressNeighborhood,
    addressNumber,
    addressPostalCode,
    addressState,
    addressStreet,
    corporateReason,
    domain 
  } = data

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca a enterprise existente
  const existingEnterprise = await EnterpriseModel.findEnterpriseById(id);
  if (!existingEnterprise) {
    throw new EnterpriseNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar
  if (enterpriseType === 'STANDARD' && existingEnterprise.id !== enterpriseId) {
    throw new NotPermissionForAction();
  }
  if (cnpj) {
    const enterpriseWithSameCnpj =
      await EnterpriseModel.findEnterpriseByCnpj(cnpj);
    if (enterpriseWithSameCnpj && enterpriseWithSameCnpj.id !== id) {
      throw new CnpjAlreadyRegisteredError();
    }
  }

  // 4. Atualiza
  try {
    let imageUrl: string | undefined;
    if (logo && logo.startsWith('data:image') && id) {
      try {
        imageUrl = await uploadFileToUploadService(logo, id, name);
      } catch (error) {
        throw new Error(`Erro ao fazer upload da imagem: ${error}`);
      }
    } else {
      imageUrl = logo;
    }

    const result = await EnterpriseModel.updateEnterprise(id, {
      name,
      cnpj,
      logo: imageUrl,
      webhookDeploy,
      briefing,
      MapCoverage,
      addressCity, 
      addressComplement, 
      addressCountry, 
      addressNeighborhood,
      addressNumber,
      addressPostalCode,
      addressState,
      addressStreet,
      corporateReason,
      domain 
    });

    if (!result) {
      throw new Error('Erro ao tentar atualizar a empresa');
    }

    return result;
  } catch (error) {
    if (error instanceof EnterpriseApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao atualizar dados');
  }
};

export const deleteEnterprise = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a enterprise existe antes de tentar deletá-la
  const enterprise = await EnterpriseModel.findEnterpriseById(id);
  if (!enterprise) {
    throw new EnterpriseNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (enterpriseType === 'STANDARD' && enterprise?.id !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (enterprise.deletedAt !== null) {
    throw new EnterpriseAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await EnterpriseModel.softDeleteEnterprise(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a enterprise');
    }

    return result;
  } catch (error) {
    if (error instanceof EnterpriseApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao deletar a enterprise');
  }
};

export const getEnterpriseByApiKey = async (
  apiKey: string,
) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }
  const enterpriseId = AuthApiKeys.enterpriseId;

  if ( !enterpriseId) {
    throw new EnterpriseNotFoundError();
  }

  try {
    const enterpise = await EnterpriseModel.findPublicEnterprise(
      enterpriseId
    );
    
    if(!enterpise){
      return []
    }

    return enterpise.MapCoverage;

  } catch (error) {
    if (error instanceof EnterpriseApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

