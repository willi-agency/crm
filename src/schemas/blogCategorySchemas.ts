// src/schemas/blogCategorySchemas.ts
import { z } from 'zod';

// Schema para criação de categoria
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, 'O nome da categoria deve ter no mínimo 3 caracteres'),
  slug: z
    .string()
    .min(3, 'Slug é obrigatório')
    .max(60, 'Slug muito longo')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
  enterpriseId: z.string(),
});

// Schema para buscar categoria por slug
export const getCategoryBySlugSchema = z.object({
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
export const getCategoryByIdSchema = z.object({
  id: z.string().min(1, 'Id é obrigatório').uuid('ID inválido'),
});

// Schema para buscar categoria por slug
export const getAllCategoriesSchema = z.object({
  enterpriseId: z.string().optional(),
});

export const updateCategorySchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(1, 'Nome da tag é obrigatório'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
  enterpriseId: z.string(),
});

export const deleteCategorySchema = z.object({
  id: z.string().uuid('ID inválido'),
});
