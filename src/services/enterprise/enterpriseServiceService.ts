// src/services/enterprise/enterpriseServiceService.ts
import { ScopeType } from '../../types/scopeType';
import * as ServiceModel from '../../models/enterprise/enterpriseServiceModel';
import {
  ServiceAlreadyRegisteredError,
  ServiceAlreadyDeletedError,
  ServiceNotFoundError,
  EnterpriseServiceApiError,
} from '../../utils/errors/enterprise/enterpriseServiceApiError';
import {
  CreateServiceDTO,
  FindServiceFilter,
  UpdateServiceDTO,
} from '../../schemas/enterprise/enterpriseServiceSchemas';
import {
  applyEnterpriseFilter,
  requireMaster,
  validateEnterpriseScope,
  validateStandardAccess,
} from '../authorizationService';
import { PaginationParams } from '../../utils/pagination';
import { BusinessMessages } from '../../constants/messages';

// =============== CREATE ===============
export const createService = async (
  data: CreateServiceDTO,
  scope: ScopeType
) => {
  const { name, description, status, version, config } = data;

  validateEnterpriseScope(scope);

  // require master user for action
  requireMaster(scope);

  // Optional: check if a service with same name exists
  const existingService = await ServiceModel.findAllServices({ name });

  if (existingService.data.length) {
    throw new ServiceAlreadyRegisteredError();
  }

  try {
    const service = await ServiceModel.createService({
      name,
      description,
      status,
      version,
      config,
    });

    return {
      data: service,
      message: BusinessMessages.service.create.success,
    };
  } catch (error) {
    if (error instanceof EnterpriseServiceApiError) throw error;
    throw new Error(BusinessMessages.service.create.genericError);
  }
};

// =============== GET ALL ===============
export const getAllServices = async (
  scope: ScopeType,
  filter: Partial<FindServiceFilter> = {},
  pagination?: PaginationParams
) => {
  validateEnterpriseScope(scope);
  const effectiveFilter = applyEnterpriseFilter(scope, filter);

  try {
    const services = await ServiceModel.findAllServices(effectiveFilter, pagination);
    return {
      data: services.data,
      pagination: services.pagination,
      message: services.data.length
        ? BusinessMessages.service.get.ManySuccess
        : BusinessMessages.service.get.notFound,
    };
  } catch (error) {
    if (error instanceof EnterpriseServiceApiError) throw error;
    throw new Error(BusinessMessages.service.get.genericError);
  }
};

// =============== GET BY ID ===============
export const getServiceById = async (scope: ScopeType, id: string) => {
  validateEnterpriseScope(scope);

  try {
    const service = await ServiceModel.findServiceById(id);

    if (service) {
      validateStandardAccess(scope, service?.id); // optional, adjust as needed
    }

    return {
      data: service,
      message: service
        ? BusinessMessages.service.get.OneSuccess
        : BusinessMessages.service.get.notFound,
    };
  } catch (error) {
    if (error instanceof EnterpriseServiceApiError) throw error;
    throw new Error(BusinessMessages.service.get.genericError);
  }
};

// =============== UPDATE ===============
export const updateService = async (
  id: string,
  data: UpdateServiceDTO,
  scope: ScopeType
) => {
  const { name, description, status, version, config } = data;

  validateEnterpriseScope(scope);

  const existingService = await ServiceModel.findServiceById(id);
  if (!existingService) throw new ServiceNotFoundError();

  validateStandardAccess(scope, existingService.id);

  try {
    const updatedService = await ServiceModel.updateService(id, {
      name,
      description,
      status,
      version,
      config,
    });

    if (!updatedService) throw new Error(BusinessMessages.service.update.genericError);

    return {
      data: updatedService,
      message: BusinessMessages.service.update.success,
    };
  } catch (error) {
    if (error instanceof EnterpriseServiceApiError) throw error;
    throw new Error(BusinessMessages.service.update.genericError);
  }
};

// =============== DELETE ===============
export const deleteService = async (id: string, scope: ScopeType) => {
  validateEnterpriseScope(scope);

  const service = await ServiceModel.findServiceById(id);
  if (!service) throw new ServiceNotFoundError();

  validateStandardAccess(scope, service.id);

  if (service.deletedAt !== null) {
    throw new ServiceAlreadyDeletedError();
  }

  try {
    const deletedService = await ServiceModel.softDeleteService(id);
    if (!deletedService) throw new Error(BusinessMessages.service.delete.genericError);

    return {
      data: deletedService,
      message: BusinessMessages.service.delete.success,
    };
  } catch (error) {
    if (error instanceof EnterpriseServiceApiError) throw error;
    throw new Error(BusinessMessages.service.delete.genericError);
  }
};
