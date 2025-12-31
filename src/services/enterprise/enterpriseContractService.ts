// src/services/enterprise/enterpriseContractService.ts
import { ScopeType } from '../../types/scopeType';
import * as ContractModel from '../../models/enterprise/enterpriseContractModel';
import {
  ContractAlreadyRegisteredError,
  ContractAlreadyDeletedError,
  ContractNotFoundError,
  EnterpriseContractApiError,
} from '../../utils/errors/enterprise/enterpriseContractApiError';
import { uploadFileToUploadService } from '../uploadFileToUploadService';
import {
  CreateContractDTO,
  FindContractFilter,
  UpdateContractDTO,
} from '../../schemas/enterprise/enterpriseContractSchemas';
import {
  applyEnterpriseFilter,
  validateEnterpriseScope,
  validateStandardAccess,
} from '../authorizationService';
import { PaginationParams } from '../../utils/pagination';
import { BusinessMessages } from '../../constants/messages';

// =============== CREATE ===============
export const createContract = async (
  data: CreateContractDTO,
  scope: ScopeType
) => {
  const {
    name,
    type,
    previousId,
    status,
    financialStatus,
    version,
    startDate,
    endDate,
    renegotiatedAt,
    price,
    currency,
    billingCycle,
    notes,
    documentUrl,
    webhookDeploy,
    enterpriseId,
    serviceId,
    siteDetails,
  } = data;

  validateEnterpriseScope(scope);
  validateStandardAccess(scope, enterpriseId);

  const contractCount = await ContractModel.countContracts();
  const nextNumber = contractCount + 1;
  const code = `CTR${String(nextNumber).padStart(3, '0')}`;

  const existingContract = await ContractModel.findContractByCode(code);
  if (existingContract) {
    throw new ContractAlreadyRegisteredError();
  }

  try {
    let uploadedDocumentUrl: string | undefined;
    if (documentUrl && documentUrl.startsWith('data:application/pdf')) {
      try {
        uploadedDocumentUrl = await uploadFileToUploadService(documentUrl, enterpriseId, code);
      } catch (error) {
        throw new Error(`Erro ao fazer upload do PDF: ${error}`);
      }
    } else {
      uploadedDocumentUrl = documentUrl;
    }

    const contract = await ContractModel.createContract(
      {
        name,
        code,
        type,
        previousId,
        status,
        financialStatus,
        version,
        startDate,
        endDate,
        renegotiatedAt,
        price,
        currency,
        billingCycle,
        notes,
        documentUrl: uploadedDocumentUrl,
        webhookDeploy,
        enterprise: { connect: { id: enterpriseId } },
        service: { connect: { id: serviceId } },
      },
      siteDetails
    );

    return {
      data: contract,
      message: BusinessMessages.contract.create.success,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof EnterpriseContractApiError) throw error;
    throw new Error(BusinessMessages.contract.create.genericError);
  }
};

// =============== GET ALL ===============
export const getAllContracts = async (
  scope: ScopeType,
  filter: Partial<FindContractFilter> = {},
  pagination?: PaginationParams
) => {
  validateEnterpriseScope(scope);
  const effectiveFilter = applyEnterpriseFilter(scope, filter);

  try {
    const contracts = await ContractModel.findAllContracts(effectiveFilter, pagination);
    return {
      data: contracts.data,
      pagination: contracts.pagination,
      message: contracts.data.length
        ? BusinessMessages.contract.get.ManySuccess
        : BusinessMessages.contract.get.notFound,
    };
  } catch (error) {
    if (error instanceof EnterpriseContractApiError) throw error;
    throw new Error(BusinessMessages.contract.get.genericError);
  }
};

// =============== GET BY CODE ===============
export const getContractByCode = async (
  scope: ScopeType,
  code: string
) => {
  validateEnterpriseScope(scope);
  try {
    const contract = await ContractModel.findContractByCode(code);
    if(contract){
      validateStandardAccess(scope, contract?.enterpriseId);
    }
    
    return {
      data: contract,
      message: contract
        ? BusinessMessages.contract.get.OneSuccess
        : BusinessMessages.contract.get.notFound,
    };
  } catch (error) {
    if (error instanceof EnterpriseContractApiError) throw error;
    throw new Error(BusinessMessages.contract.get.genericError);
  }
};

// =============== UPDATE ===============
export const updateContract = async (
  id: string,
  data: UpdateContractDTO,
  scope: ScopeType
) => {
  const {
    name,
    type,
    previousId,
    status,
    financialStatus,
    version,
    startDate,
    endDate,
    renegotiatedAt,
    price,
    currency,
    billingCycle,
    notes,
    documentUrl,
    webhookDeploy,
    serviceId,
    siteDetails,
  } = data;

  validateEnterpriseScope(scope);

  const existingContract = await ContractModel.findContractById(id);
  if (!existingContract) throw new ContractNotFoundError();

  validateStandardAccess(scope, existingContract.enterpriseId);

  try {
    let uploadedDocumentUrl: string | undefined;
    if (documentUrl && documentUrl.startsWith('data:application/pdf')) {
      try {
        uploadedDocumentUrl = await uploadFileToUploadService(documentUrl, existingContract.enterpriseId ?? existingContract.code);
      } catch (error) {
        throw new Error(`Erro ao fazer upload do PDF: ${error}`);
      }
    } else {
      uploadedDocumentUrl = documentUrl;
    }

    const updatedContract = await ContractModel.updateContract(
      id, 
      {
        name,
        type,
        previousId,
        status,
        financialStatus,
        version,
        startDate,
        endDate,
        renegotiatedAt,
        price,
        currency,
        billingCycle,
        notes,
        documentUrl: uploadedDocumentUrl,
        webhookDeploy,
        serviceId,
      },
      siteDetails
    );

    if (!updatedContract) throw new Error(BusinessMessages.contract.update.genericError);

    return {
      data: updatedContract,
      message: BusinessMessages.contract.update.success,
    };
  } catch (error) {
    if (error instanceof EnterpriseContractApiError) throw error;
    throw new Error(BusinessMessages.contract.update.genericError);
  }
};

// =============== DELETE ===============
export const deleteContract = async (id: string, scope: ScopeType) => {
  validateEnterpriseScope(scope);

  const contract = await ContractModel.findContractById(id);
  if (!contract) throw new ContractNotFoundError();

  validateStandardAccess(scope, contract.enterpriseId);

  if (contract.deletedAt !== null) {
    throw new ContractAlreadyDeletedError();
  }

  try {
    const deletedContract = await ContractModel.softDeleteContract(id);
    if (!deletedContract) throw new Error(BusinessMessages.contract.delete.genericError);

    return {
      data: deletedContract,
      message: BusinessMessages.contract.delete.success,
    };
  } catch (error) {
    if (error instanceof EnterpriseContractApiError) throw error;
    throw new Error(BusinessMessages.contract.delete.genericError);
  }
};
