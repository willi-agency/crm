import { z } from 'zod';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
  description: z.string().min(1, 'Descrição é obrigatória'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  rawContent: z.union([z.string(), z.record(z.any())]).optional(),
  image: z.string().optional(),
  authorId: z.string().min(1, 'ID do autor é obrigatório'),
  categoryId: z.string().optional(),
  datePublished: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Data de publicação inválida',
    })
    .optional(),
  status: z.nativeEnum(ArticleStatus),
  tagIds: z.array(z.string()).optional(),
  enterpriseId: z.string().min(1, 'ID da empresa é obrigatório'),
  contractId: z.string().optional(),
});
export type CreateArticleDTO = z.infer<typeof createArticleSchema>;

export const updateArticleSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório'),
    slug: z
      .string()
      .min(1, 'Slug é obrigatório')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug deve conter apenas letras minúsculas, números e hifens'
      ),
    description: z.string().min(1, 'Descrição é obrigatória'),
    content: z.string().min(1, 'Conteúdo é obrigatório'),
    image: z.string().url('Precisa ser uma URL válida'),
    authorId: z.string().min(1, 'ID do autor é obrigatório'),
    categoryId: z.string(),
    datePublished: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Data de publicação inválida',
      }),
    status: z.nativeEnum(ArticleStatus).optional(),
    tagIds: z.array(z.string()).optional(),
  })
  .partial();

export type UpdateArticleDTO = z.infer<typeof updateArticleSchema>;

export const getArticleBySlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hifens'
    ),
});

export const getArticleByIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const deleteArticleSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
