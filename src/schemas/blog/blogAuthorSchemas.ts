import { z } from 'zod';
import { IdField, ImageUrlOrBase64Field, NameField, UrlField } from '../common/fields';

/** CREATE / UPDATE */
export const createAuthorSchema = z.object({
  name: NameField,
  bio: z.string().min(10, 'Biografia é obrigatória'),
  sameAs: z.array(z.string()).optional(),
  image: ImageUrlOrBase64Field.optional(),
  profileUrl: UrlField.optional(),
  enterpriseId: IdField,
  contractId: IdField.optional(),
});

export const updateAuthorSchema = z.object({
  name: NameField,
  bio: z.string().min(10, 'Biografia é obrigatória'),
  sameAs: z.array(z.string()).optional(),
  image: ImageUrlOrBase64Field.optional(),
  profileUrl: UrlField.optional(),
  contractId: IdField,
}).partial();

/** GET / FILTER / PAGINAÇÃO */
export const getAllAuthorsSchema = z.object({
  enterpriseId: IdField.optional(),
  name: NameField.optional(),
  bio: z.string().optional(),
  sameAs: z.array(z.string()).optional(),
  contractId: IdField.optional(),
});

export const getAuthorByIdSchema = z.object({
  id: IdField,
});

export const getAuthorByNameSchema = z.object({
  name: z.string().min(1, 'Nome do autor é obrigatório'),
  enterpriseId: IdField.optional(),
});

export const deleteAuthorSchema = z.object({
  id: IdField,
});

/** TYPES */
export type CreateBlogAuthorDTO = z.infer<typeof createAuthorSchema>;
export type UpdateBlogAuthorDTO = z.infer<typeof updateAuthorSchema>;
export type FindBlogAuthorFilter = z.infer<typeof getAllAuthorsSchema>;
export type FindBlogAuthorById = z.infer<typeof getAuthorByIdSchema>;
export type FindBlogAuthorByName = z.infer<typeof getAuthorByNameSchema>;
