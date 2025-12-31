// src/services/autorService.ts
import { ScopeType } from '../../types/scopeType';
import * as BlogAuthorModel from '../../models/blog/blogAuthorModel';
import {
  ProfileAlreadyRegisteredError,
  AuthorAlreadyDeletedError,
  AuthorNotFoundError,
  BlogAuthorApiError,
} from '../../utils/errors/blog/blogAuthorApiError';
import { uploadFileToUploadService } from '../uploadFileToUploadService';
import { CreateBlogAuthorDTO, FindBlogAuthorByName, FindBlogAuthorFilter, UpdateBlogAuthorDTO } from '../../schemas/blog/blogAuthorSchemas';
import { applyEnterpriseFilter, applyEnterpriseIdFilter, validateEnterpriseScope, validateStandardAccess } from '../authorizationService';
import { BusinessMessages } from '../../constants/messages';
import { PaginationSchema } from '../../schemas/paginationSchema.ts';

export const createAuthor = async (
  data: CreateBlogAuthorDTO,
  scope: ScopeType
) => {

  const {
    name,
    bio,
    image,
    profileUrl,
    sameAs,
    enterpriseId,
  } = data;

  // Validação do escopo
  validateEnterpriseScope(scope);
  
  // Verifica se o usuário tem permissão para editar
  validateStandardAccess(scope, enterpriseId);

  const existingAuthor = await BlogAuthorModel.findAuthorByName(name, enterpriseId);

  if (existingAuthor.length > 0) {
    throw new ProfileAlreadyRegisteredError();
  }

  let imageUrl: string | undefined;
  if (image && image.startsWith('data:image')) {
    try {
      imageUrl = await uploadFileToUploadService(image, enterpriseId, name);
    } catch (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error}`);
    }
  } else {
    imageUrl = image;
  }

  const autor = await BlogAuthorModel.createAuthor({
    name,
    bio,
    profileUrl,
    sameAs,
    image: imageUrl,
    enterprise: {
      connect: { id: enterpriseId },
    },
  });

  return {
    data: autor,
    message: BusinessMessages.author.create.success,
  };
};

export const getAllAuthors = async (
  scope: ScopeType,
  filter: Partial<FindBlogAuthorFilter> = {},
  pagination?: PaginationSchema
) => {
  // Valida escopo
  validateEnterpriseScope(scope);

  // Aplica filtro do escopo (STANDARD só vê os próprios dados)
  const effectiveFilter = applyEnterpriseFilter(scope, filter);

  const authors = await BlogAuthorModel.findAllAuthors(effectiveFilter, pagination);
    return {
      data: authors.data || [],
      pagination: authors.pagination,
      message: authors.data.length
        ? BusinessMessages.author.get.ManySuccess
        : BusinessMessages.author.get.notFound,
    };
  };

export const getAuthorByName = async (scope: ScopeType, data: FindBlogAuthorByName) => {
  validateEnterpriseScope(scope);
  const { name, enterpriseId } = data;
  const effectiveEnterpriseId = applyEnterpriseIdFilter(scope, enterpriseId);

  try {
    const authors = await BlogAuthorModel.findAuthorByName(name, effectiveEnterpriseId);

    return {
      data: authors,
      message: authors.length
        ? BusinessMessages.author.get.OneSuccess
        : BusinessMessages.author.get.notFound,
    };

  } catch (error) {
    if (error instanceof BlogAuthorApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error(BusinessMessages.author.get.genericError);
  }
};

export const updateAuthor = async (
  id: string,
  data: UpdateBlogAuthorDTO,
  scope: ScopeType
) => {
  const { name, bio, image, profileUrl, sameAs } = data;

  // Validação do escopo
  validateEnterpriseScope(scope);

  // 1. Busca o autor existente
  const existingAuthor = await BlogAuthorModel.findAuthorById(id);

  if (!existingAuthor) {
    throw new AuthorNotFoundError();
  }

  // Verifica se o usuário tem permissão para editar
  validateStandardAccess(scope, existingAuthor.enterpriseId);

  // Atualiza
  try {
    let imageUrl: string | undefined;
    if (image && image.startsWith('data:image')) {
      try {
        imageUrl = await uploadFileToUploadService(image, existingAuthor.enterpriseId, name);
      } catch (error) {
        throw new Error(`Erro ao fazer upload da imagem: ${error}`);
      }
    } else {
      imageUrl = image;
    }

    const updatedAuthor  = await BlogAuthorModel.updateAuthor(id, {
      name,
      bio,
      profileUrl,
      sameAs,
      image: imageUrl,
    });

    if (!updatedAuthor ) {
      throw new Error(BusinessMessages.author.update.genericError);
    }

    return {
      data: updatedAuthor,
      message: BusinessMessages.author.update.success,
    };

  } catch (error) {
    if (error instanceof BlogAuthorApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error(BusinessMessages.author.update.genericError);
  }
};

export const deleteAuthor = async (id: string, scope: ScopeType) => {

  // Validação do escopo
  validateEnterpriseScope(scope);

  // Verificando se o autor existe antes de tentar deletá-la
  const autor = await BlogAuthorModel.findAuthorById(id);

  if (!autor) {
    throw new AuthorNotFoundError();
  }

  // Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  validateStandardAccess(scope, autor?.enterpriseId);

  if (autor.deletedAt !== null) {
    throw new AuthorAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const deletedAuthor = await BlogAuthorModel.softDeleteAuthor(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!deletedAuthor) {
      throw new Error(BusinessMessages.author.delete.genericError);
    }

    return {
      data: deletedAuthor,
      message: BusinessMessages.author.delete.success,
    };

  } catch (error) {
    if (error instanceof BlogAuthorApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error(BusinessMessages.author.delete.genericError);
  }
};