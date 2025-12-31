// src/services/utmSubmissionService.ts
import * as utmErrors from '../../utils/errors/campaign/utmSubmissionApiError';
import * as UtmSubmissionModel from '../../models/campaign/utmSubmissionModel';
import { ScopeType } from '../../types/scopeType';
import {
  CheckSimilarityInput,
  CreateUtmSubmissionDTO,
  UtmSubmissionFilterType,
} from '../../schemas/campaign/utmSubmissionSchemas';
import { PaginationSchema } from '../../schemas/paginationSchema.ts';
import { applyEnterpriseFilter, validateEnterpriseScope, validateStandardAccess } from '../authorizationService';
import { BusinessMessages } from '../../constants/messages';

/**
 * CREATE
 */
export const createUtmSubmission = async (
  data: CreateUtmSubmissionDTO,
  scope: ScopeType
) => {
  validateEnterpriseScope(scope);
  validateStandardAccess(scope, data.enterpriseId);

  const submission = await UtmSubmissionModel.createUtmSubmission({
    ...data,
    createdById: scope.id,
  });

  return {
    data: submission,
    message: BusinessMessages.utmSubmission.create.success,
  };
};

/**
 * Função auxiliar para montar a URL completa com UTMs
 */
const buildFullUrl = (baseUrl: string, fields: { utmField: string; utmValue: string }[]) => {
  if (!fields || fields.length === 0) return baseUrl;

  const query = fields
    .map(f => `${encodeURIComponent(f.utmField)}=${encodeURIComponent(f.utmValue)}`)
    .join('&');

  // garante a barra antes do "?" se não existir
  const separator = baseUrl.endsWith('/') ? '' : '/';

  return `${baseUrl}${separator}?${query}`;
};

/**
 * GET ALL
 */
export const getAllUtmSubmissions = async (
  scope: ScopeType,
  filter: Partial<UtmSubmissionFilterType> = {},
  pagination?: PaginationSchema
) => {
  validateEnterpriseScope(scope);

  const effectiveFilter = applyEnterpriseFilter(scope, filter);

  const submissions = await UtmSubmissionModel.findAllUtmSubmissions(effectiveFilter, pagination) || [];

  // Monta URL completa para cada submission
  const dataWithUrls = submissions.data.map(sub => ({
    ...sub,
    urlPath: buildFullUrl(sub.baseUrl, sub.fields),
  }));

  return {
    data: dataWithUrls || [],
    pagination: submissions.pagination,
    message: dataWithUrls.length
      ? BusinessMessages.utmSubmission.get.ManySuccess
      : BusinessMessages.utmSubmission.get.notFound,
  };
};

/**
 * GET BY ID
 */
export const getUtmSubmissionById = async (id: string, scope: ScopeType) => {
  validateEnterpriseScope(scope);

  const submission = await UtmSubmissionModel.findUtmSubmissionById(id);
  if (!submission) throw new utmErrors.UtmSubmissionNotFoundError();

  validateStandardAccess(scope, submission.enterpriseId);

  return {
    data: {
      ...submission,
      urlPath: buildFullUrl(submission.baseUrl, submission.fields),
    },
    message: BusinessMessages.utmSubmission.get.OneSuccess,
  };
};

/**
 * Verifica similaridade das UTMs recebidas
 */
export const checkUtmSimilarity = async (
  data: CheckSimilarityInput,
  scope: ScopeType,
  threshold: number = 0.8
) => {
  validateEnterpriseScope(scope);
  validateStandardAccess(scope, data.enterpriseId);

  const rawFilter: Partial<UtmSubmissionFilterType> = {
    enterpriseId: data.enterpriseId,
    contractId: data.contractId,
  };

  const effectiveFilter = applyEnterpriseFilter(scope, rawFilter);
  const similarSubmissions = await UtmSubmissionModel.findSimilarUtmSubmissions(data, threshold, effectiveFilter);

  if (!similarSubmissions.length) {
    return { data: [], message: BusinessMessages.utmSubmission.get.notFound };
  }
  
  // Limita a 20 resultados
  const limitedSubmissions = similarSubmissions.slice(0, 20);

  const dataWithUrls = limitedSubmissions.map(sub => ({
    ...sub,
    urlPath: buildFullUrl(sub.baseUrl, sub.fields),
  }));

  return {
    data: dataWithUrls,
    message: BusinessMessages.utmSubmission.get.ManySuccess,
  };
};

