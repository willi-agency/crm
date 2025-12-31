// src/schemas/blog/taxonomySchemas.ts
import { z } from 'zod';
import { IdField, ImageUrlOrBase64Field, NameField, SlugField, UrlField } from '../common/fields';

/** CREATE / UPDATE */
export const createTaxonomySchema = z.object({
  name: NameField,
  slug: SlugField,
  type: z.enum(['tag', 'category', 'collection'], { required_error: 'Tipo é obrigatório' }),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  thumb: ImageUrlOrBase64Field.optional(),
  enterpriseId: IdField,
  contractId: IdField.optional(),
});

export const updateTaxonomySchema = z.object({
  name: NameField.optional(),
  slug: SlugField.optional(),
  type: z.enum(['tag', 'category', 'collection']).optional(),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  thumb: ImageUrlOrBase64Field.optional(),
  contractId: IdField.optional(),
}).partial();

/** GET / FILTER / PAGINAÇÃO */
export const getAllTaxonomiesSchema = z.object({
  enterpriseId: IdField.optional(),
  name: NameField.optional(),
  slug: z.string().optional(),
  type: z.enum(['tag', 'category', 'collection']).optional(),
  contractId: IdField.optional(),
});

export const getTaxonomyByIdSchema = z.object({
  id: IdField,
});

export const deleteTaxonomySchema = z.object({
  id: IdField,
});

/** TYPES */
export type CreateTaxonomyDTO = z.infer<typeof createTaxonomySchema>;
export type UpdateTaxonomyDTO = z.infer<typeof updateTaxonomySchema>;
export type FindTaxonomyFilter = z.infer<typeof getAllTaxonomiesSchema>;
export type FindTaxonomyById = z.infer<typeof getTaxonomyByIdSchema>;