import { z } from 'zod';
import { ContentField, DatePublishedField, DescriptionField, IdField, ImageUrlOrBase64Field, SlugField, TitleField } from '../common/fields';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum TaxonyEnum {
  tag = "tag",
  category = "category",
  collection = "collection"
}


export const createArticleSchema = z.object({
  title: TitleField,
  slug: SlugField,
  description: DescriptionField,
  recommended: z.boolean().optional().default(false),
  content: ContentField,
  rawContent: z.union([z.string(), z.record(z.any())]).optional(),
  image: ImageUrlOrBase64Field.optional(),
  authorId: IdField,
  categoryId: IdField,
  datePublished: DatePublishedField.optional(),
  status: z.nativeEnum(ArticleStatus),
  tagIds: z.array(z.string()).optional(),
  collectionsIds: z.array(z.string()).optional(),
  enterpriseId: IdField,
  contractId: IdField.optional(),
});

export const updateArticleSchema = z.object({
  title: TitleField,
  slug: SlugField,
  description: DescriptionField,
  recommended: z.boolean().optional().default(false),
  content: ContentField,
  image: ImageUrlOrBase64Field,
  authorId: IdField,
  categoryId: IdField,
  datePublished: DatePublishedField,
  status: z.nativeEnum(ArticleStatus).optional(),
  tagIds: z.array(z.string()).optional(),
  collectionsIds: z.array(z.string()).optional(),
}).partial();

export const getArticleBySlugSchema = z.object({
  slug: SlugField,
  enterpriseId: IdField.optional(),
});

export const getAllArticlesSchema = z.object({
  enterpriseId: IdField.optional(),
  contractId: IdField.optional(),
  title: TitleField.optional(),
  slug: SlugField.optional(),
  description: DescriptionField.optional(),
  recommended: z.coerce.boolean().optional(),
  taxonomyId: IdField.optional(),
  authorId: IdField.optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  search: z.string().optional(),

  page: z
    .preprocess((val) => Number(val), z.number().int().positive().default(1))
    .optional(),

  perPage: z
    .preprocess((val) => Number(val), z.number().int().positive().default(20))
    .optional(),
});

export const getPublicsArticlesSchema = z.object({
  title: TitleField.optional(),
  slug: SlugField.optional(),
  category: SlugField.optional(),
  taxonomy: SlugField.optional(),
  taxonomyType: z.nativeEnum(TaxonyEnum).optional(),
  tag: SlugField.optional(),
  description: DescriptionField.optional(),
  recommended: z.coerce.boolean().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  search: z.string().optional(),
});

export const getArticleByIdSchema = z.object({
  id: IdField,
});

export const deleteArticleSchema = z.object({
  id: IdField,
});

export const getHomeQuerySchema = z.object({
  listTags: z.coerce.boolean().optional().default(false),
  listCollections: z
    .preprocess((val) => {
      if (!val) return [];
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          return [parsed];
        } catch {
          return [val];
        }
      }
      return Array.isArray(val) ? val : [val];
    }, z.array(z.string()))
    .optional()
    .default([]),
  listCategories: z.coerce.boolean().optional().default(false),
  listAuthors: z.coerce.boolean().optional().default(false),
  newPosts: z.coerce.number().int().positive().optional(),
  recommendedPosts: z.coerce.number().int().positive().optional(),
});

export type CreateArticleDTO = z.infer<typeof createArticleSchema>;
export type UpdateArticleDTO = z.infer<typeof updateArticleSchema>;
export type BlogArticleFilterType = z.infer<typeof getAllArticlesSchema>;
export type BlogPublicArticlesFilterType = z.infer<typeof getPublicsArticlesSchema>;
export type FindBySlugArticle = z.infer<typeof getArticleBySlugSchema>;
export type BlogHomeQueryType = z.infer<typeof getHomeQuerySchema>;