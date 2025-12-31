// src/services/taxonomyService.ts
import { ScopeType } from '../../types/scopeType';
import * as TaxonomyModel from '../../models/blog/blogTaxonomyModel';
import {
  TaxonomyAlreadyDeletedError,
  TaxonomyNotFoundError,
  TaxonomyApiError,
  TaxonomyAlreadyRegisteredError,
} from '../../utils/errors/blog/blogTaxonomyApiError';
import { uploadFileToUploadService } from '../uploadFileToUploadService';
import { CreateTaxonomyDTO, UpdateTaxonomyDTO, FindTaxonomyFilter, FindTaxonomyById } from '../../schemas/blog/taxonomySchemas';
import { applyEnterpriseFilter, applyEnterpriseIdFilter, validateEnterpriseScope, validateStandardAccess } from '../authorizationService';
import { BusinessMessages } from '../../constants/messages';
import { PaginationSchema } from '../../schemas/paginationSchema.ts';

// --- CREATE ---
export const createTaxonomy = async (
  data: CreateTaxonomyDTO,
  scope: ScopeType
) => {
  const { slug, name, type, thumb, enterpriseId, contractId, description, metaDescription, metaTitle } = data;

  validateEnterpriseScope(scope);
  validateStandardAccess(scope, enterpriseId);

  console.log(slug, enterpriseId, type);
  const existing = await TaxonomyModel.findUniqueTaxonomyBySlug(slug, type, enterpriseId);
  console.log(existing);
  if (existing) throw new TaxonomyAlreadyRegisteredError();

  let thumbUrl: string | undefined;
  if (thumb && thumb.startsWith('data:image')) {
    try {
      thumbUrl = await uploadFileToUploadService(thumb, enterpriseId, name);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da thumb: ${error}`);
    }
  } else {
    thumbUrl = thumb;
  }

  const taxonomy = await TaxonomyModel.createTaxonomy({
    name,
    slug,
    type,
    enterprise: { connect: { id: enterpriseId } },
    contract: contractId ? { connect: { id: contractId } } : undefined,
    thumb,
    description,
    metaTitle,
    metaDescription,
  });

  return {
    data: taxonomy,
    message: BusinessMessages.taxonomy.create.success,
  };
};

// --- FIND ALL ---
export const getAllTaxonomies = async (
  scope: ScopeType,
  filter: Partial<FindTaxonomyFilter> = {},
  pagination?: PaginationSchema
) => {
  validateEnterpriseScope(scope);
  const effectiveFilter = applyEnterpriseFilter(scope, filter);

  const taxonomies = await TaxonomyModel.findAllTaxonomies(effectiveFilter, pagination);
  return {
    data: taxonomies.data || [],
    pagination: taxonomies.pagination,
    message: taxonomies.data.length
      ? BusinessMessages.taxonomy.get.ManySuccess
      : BusinessMessages.taxonomy.get.notFound,
  };
};

export const getTaxonomyById = async (scope: ScopeType, data: FindTaxonomyById) => {
  validateEnterpriseScope(scope);
  const { id } = data;
  const taxonomy = await TaxonomyModel.findTaxonomyById(id);
  if (!taxonomy) throw new TaxonomyNotFoundError();
  validateStandardAccess(scope, taxonomy.enterpriseId);

  return {
    data: taxonomy,
    message: BusinessMessages.taxonomy.get.OneSuccess
  };
};

// --- UPDATE ---
export const updateTaxonomy = async (
  id: string,
  data: UpdateTaxonomyDTO,
  scope: ScopeType
) => {
  validateEnterpriseScope(scope);

  const existing = await TaxonomyModel.findTaxonomyById(id);
  if (!existing) throw new TaxonomyNotFoundError();
  validateStandardAccess(scope, existing.enterpriseId);

  let thumbUrl: string | undefined;
  if (data.thumb && data.thumb.startsWith('data:image')) {
    try {
      thumbUrl = await uploadFileToUploadService(data.thumb, existing.enterpriseId, data.name || existing.name);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da thumb: ${error}`);
    }
  } else {
    thumbUrl = data.thumb;
  }

  const updated = await TaxonomyModel.updateTaxonomy(id, {
    ...data,
    thumb: thumbUrl,
  });

  if (!updated) throw new Error(BusinessMessages.taxonomy.update.genericError);

  return {
    data: updated,
    message: BusinessMessages.taxonomy.update.success,
  };
};

// --- SOFT DELETE ---
export const deleteTaxonomy = async (id: string, scope: ScopeType) => {
  validateEnterpriseScope(scope);

  const taxonomy = await TaxonomyModel.findTaxonomyById(id);
  if (!taxonomy) throw new TaxonomyNotFoundError();
  validateStandardAccess(scope, taxonomy.enterpriseId);

  if (taxonomy.deletedAt !== null) throw new TaxonomyAlreadyDeletedError();

  const deleted = await TaxonomyModel.softDeleteTaxonomy(id);
  if (!deleted) throw new Error(BusinessMessages.taxonomy.delete.genericError);

  return {
    data: deleted,
    message: BusinessMessages.taxonomy.delete.success,
  };
};
