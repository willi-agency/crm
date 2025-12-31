import { z } from "zod";

// Taxonomia
export const TaxonomySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  thumb: z.string().nullable(),
});

// Relação ArticleTaxonomy
export const ArticleTaxonomyRelationSchema = z.object({
  taxonomy: TaxonomySchema,
});

// Autor
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string().nullable(),
  image: z.string().nullable(),
  profileUrl: z.string().nullable(),
  sameAs: z.array(z.string()).nullable(),
});

// Artigo cru vindo do Prisma
export const RawArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),

  description: z.string().nullable(),

  image: z.string().nullable(),

  // Prisma pode retornar null
  recommended: z.boolean().nullable(),

  // Prisma retorna Date
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),

  author: AuthorSchema.optional(), // algumas queries não trazem autor
  ArticleTaxonomy: z.array(ArticleTaxonomyRelationSchema).optional(),
});

// Artigo limpo
export const CleanArticleSchema = RawArticleSchema.extend({
  taxonomies: z.array(TaxonomySchema),
}).omit({
  ArticleTaxonomy: true,
});

export type TaxonomyType = z.infer<typeof TaxonomySchema>;
export type ArticleTaxonomyRelation = z.infer<typeof ArticleTaxonomyRelationSchema>;
export type RawArticle = z.infer<typeof RawArticleSchema>;
export type CleanArticle = z.infer<typeof CleanArticleSchema>;
