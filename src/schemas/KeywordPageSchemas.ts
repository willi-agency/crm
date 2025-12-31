// src/schemas/blogKeywordPageSchemas.ts
import { z } from 'zod';

// Schema para criação de categoria
export const createKeywordPageSchema = z.object({
  keyword: z
    .string()
    .min(1, 'O nome da categoria deve ter no mínimo 3 caracteres'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(60, 'Slug muito longo')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  content: z.string().optional(),
  rawContent: z.union([z.string(), z.record(z.any())]).optional(),
  enterpriseId: z.string(),
  contractId: z.string().optional(),
  keywordPageCategoryId: z.string().optional(),
});
export type CreateKeywordPageSchemaDTO = z.infer<
  typeof createKeywordPageSchema
>;

export const updateKeywordPageSchema = z.object({
  keyword: z
    .string()
    .min(1, 'O nome da Keyword deve ter no mínimo 1 caractere').optional(),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(60, 'Slug muito longo')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  content: z.string().optional(),
  rawContent: z.union([z.string(), z.record(z.any())]).optional(),
  keywordPageCategoryId: z.string().optional(),
});
export type UpdateKeywordPageSchemaDTO = z.infer<
  typeof updateKeywordPageSchema
>;

// Schema para buscar categoria por slug
export const getKeywordPageBySlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
  enterpriseId: z.string().optional(),
});

// Schema para buscar categoria por ID
export const getKeywordPageByIdSchema = z.object({
  id: z.string().min(1, 'Id é obrigatório').uuid('ID inválido'),
});

export const keywordIdSchema = z.string().uuid();

// Schema para buscar categoria por slug
export const getAllCategoriesSchema = z.object({
  enterpriseId: z.string().optional(),
});

export const deleteKeywordPageSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
