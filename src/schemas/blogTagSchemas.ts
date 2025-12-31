import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Nome da tag é obrigatório'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(60, 'Slug muito longo')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
  enterpriseId: z.string(),
});

export const updateTagSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(1, 'Nome da tag é obrigatório'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
  enterpriseId: z.string().optional(),
});

export const getTagBySlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
});

export const getTagByIdSchema = z.object({
  id: z.string().min(1, 'Id é obrigatório').uuid('ID inválido'),
});

export const deleteTagSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
