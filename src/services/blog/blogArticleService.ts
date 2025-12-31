// src/services/BlogArticleService.ts
import * as articlesErrors from '../../utils/errors/blog/blogArticleApiError';
import * as BlogArticleModel from '../../models/blog/blogArticleModel';
import { ScopeType } from '../../types/scopeType';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../../utils/errors/scopeError';
import { BlogArticleFilterType, BlogHomeQueryType, BlogPublicArticlesFilterType, CreateArticleDTO, FindBySlugArticle, UpdateArticleDTO } from '../../schemas/blog/blogArticleSchemas';
import { CleanArticle, RawArticle } from '../../schemas/blog/getBlogHomeSchemas';
import { uploadFileToUploadService } from '../uploadFileToUploadService';
import { processImagesInContent } from '../../utils/processImageInContent';
import { triggerEnterpriseRedeploy } from '../../utils/triggerEnterpriseRedeploy';
import { findApiKeyByKey } from '../../models/apiKeyModel';
import { ApiKeyNotFoundError } from '../../utils/apiKeyApiError';
import { ArticleAlreadyDeletedError, ArticleNotFoundError, BlogArticleApiError, NotExistData } from '../../utils/blogArticleApiError';
import { applyEnterpriseFilter, applyEnterpriseIdFilter, validateEnterpriseScope, validateStandardAccess } from '../authorizationService';
import { BusinessMessages } from '../../constants/messages';
import { PaginationSchema } from '../../schemas/paginationSchema.ts';
import { findUniqueTagBySlug } from '../../models/blogTagModel';
import { findCategoryBySlug } from '../../models/blogCategoryModel';
import { findUniqueTaxonomyBySlug } from '../../models/blog/blogTaxonomyModel';

export const createBlogArticle = async (
  data: CreateArticleDTO,
  scope: ScopeType
): Promise<{ message: string; article: any }> => {
  validateEnterpriseScope(scope);
  validateStandardAccess(scope, data.enterpriseId);

  const existingArticle = await BlogArticleModel.findArticleBySlug(data.slug, data.enterpriseId);
  if (existingArticle !== null) {
    throw new articlesErrors.SlugAlreadyRegisteredError();
  }

  let imageUrl: string | undefined;
  if (data.image && data.image.startsWith('data:image') && data.enterpriseId) {
    imageUrl = await uploadFileToUploadService(data.image, data.enterpriseId, data.slug);
  } else {
    imageUrl = data.image;
  }

  const processedContent = await processImagesInContent({ content: data.content, recEnterpriseId: data.enterpriseId });

  const { authorId, enterpriseId, contractId, image,categoryId, tagIds, collectionsIds, ...rest } = data;
  const article = await BlogArticleModel.createArticle({
    ...rest,
    image: imageUrl,
    content: processedContent,
    author: { connect: { id: data.authorId } },
    enterprise: { connect: { id: data.enterpriseId } },
    contract: data.contractId ? { connect: { id: data.contractId } } : undefined,
    createdBy: { connect: { id: scope.id } },
  });

  const taxonomyIdsToLink: string[] = [];

  // categoryId pode estar presente (único)
  if (data.categoryId) {
    taxonomyIdsToLink.push(data.categoryId);
  }

  // tags (0..N)
  if (Array.isArray(data.tagIds) && data.tagIds.length > 0) {
    taxonomyIdsToLink.push(...data.tagIds);
  }

  // collections (0..N)
  if (Array.isArray(data.collectionsIds) && data.collectionsIds.length > 0) {
    taxonomyIdsToLink.push(...data.collectionsIds);
  }

  // Remove possíveis duplicados
  const uniqueTaxonomyIds = Array.from(new Set(taxonomyIdsToLink));

  if (uniqueTaxonomyIds.length > 0) {
    try {
      await BlogArticleModel.createRelationArticleTaxonomies(
        article.id,
        uniqueTaxonomyIds
      );
    } catch (err) {
      return {
        message: BusinessMessages.article.create.partialSuccess,
        article,
      };
    }
  }

  if (data.status === 'PUBLISHED') {
    triggerEnterpriseRedeploy(data.enterpriseId).catch((err) => {
      // Use um serviço de logging aqui
    });
  }

  return {
    message: BusinessMessages.article.create.success,
    article,
  };
};

export const getAllBlogArticles = async (
  scope: ScopeType,
  filter: Partial<BlogArticleFilterType> = {},
  pagination?: PaginationSchema
) => {
  // Valida escopo
  validateEnterpriseScope(scope);

  // Aplica filtro do escopo (STANDARD só vê os próprios dados)
  const effectiveFilter = applyEnterpriseFilter(scope, filter);

  const articles = await BlogArticleModel.findAllArticles(effectiveFilter, pagination);

  // Limpa e normaliza as taxonomias
  const cleaned = articles.data.map(article => {
    const taxonomies = article.ArticleTaxonomy?.map(t => t.taxonomy) || [];

    return {
      ...article,
      taxonomies,
    };
  }).map(article => {
    // Remove ArticleTaxonomy do retorno final
    const { ArticleTaxonomy, ...rest } = article;
    return rest;
  });

  return {
    data: cleaned || [],
    pagination: articles.pagination,
    message: cleaned.length
      ? BusinessMessages.article.get.ManySuccess
      : BusinessMessages.article.get.notFound,
  };
};

export const getAllPublicBlogArticlesByApiKey = async (
  apiKey: string,
  filter: Partial<BlogPublicArticlesFilterType> = {},
  pagination?: PaginationSchema
) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }

  const enterpriseId = AuthApiKeys.enterpriseId;
  const contractId = AuthApiKeys.contractId || undefined;
  const resolvedFilter: any = {};

  // TAG
  if (filter.tag) {
    const tag = await findUniqueTagBySlug(filter.tag, enterpriseId);
    if (!tag) throw new Error(`Tag não encontrada: ${filter.tag}`);
    resolvedFilter.tagId = tag.id;
  }

  // CATEGORY
  if (filter.category) {
    const category = await findCategoryBySlug(filter.category, {enterpriseId});
    if (!category) throw new Error(`Categoria não encontrada: ${filter.category}`);
    resolvedFilter.categoryId = category[0].id;
  }

  // TAXONOMY
  if (filter.taxonomy && filter.taxonomyType ) {
    console.log(filter.taxonomy, filter.taxonomyType);
    const taxonomy = await findUniqueTaxonomyBySlug(filter.taxonomy, filter.taxonomyType, enterpriseId);
    if (!taxonomy) throw new Error(`Taxonomia não encontrada: ${filter.taxonomy}`);
    resolvedFilter.taxonomyId = taxonomy.id;
    console.log(resolvedFilter.taxonomyId);
  }

  // RECOMMENDED (boolean)
  if (typeof filter.recommended === "boolean") {
    resolvedFilter.recommended = filter.recommended;
  }

  // Outros filtros opcionais
  if (filter.search) resolvedFilter.search = filter.search;
  if (filter.status) resolvedFilter.status = filter.status;

  // ---------------------------
  // 2. Buscar artigos já com filtro resolvido
  // ---------------------------
  const articles = await BlogArticleModel.findPublicAllArticles(
    enterpriseId,
    contractId,
    resolvedFilter,
    pagination
  );

  const cleaned = articles.data.map(article => {
    const taxonomies = article.ArticleTaxonomy.map(t => t.taxonomy);

    return {
      ...article,
      taxonomies,
    };
  }).map(article => {
    // remove ArticleTaxonomy do retorno final
    const { ArticleTaxonomy, ...rest } = article;
    return rest;
  });

  // RETORNO PADRONIZADO
  return {
    data: cleaned,
    pagination: articles.pagination,
    message: cleaned.length
      ? BusinessMessages.article.get.ManySuccess
      : BusinessMessages.article.get.notFound,
  };
};

export const getBlogArticleBySlug = async (scope: ScopeType, data: FindBySlugArticle ) => {
  validateEnterpriseScope(scope);

  const {slug, enterpriseId} = data;

  const effectiveEnterpriseId = applyEnterpriseIdFilter(scope, enterpriseId);

  try {
    const articles = await BlogArticleModel.findArticleBySlug(slug, effectiveEnterpriseId);

    if (!articles) {
      return [];
    }

    return articles;
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error(BusinessMessages.article.get.genericError);
  }
};

export const getPublicBlogArticleByApiKey = async (
  apiKey: string,
  slug: string
) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);

  if (!AuthApiKeys) {
    throw new ApiKeyNotFoundError();
  }

  const enterpriseId = AuthApiKeys.enterpriseId;

  const article = await BlogArticleModel.findPublicArticle(slug, enterpriseId);
  console.log(article);
  if (!article) {
    console.log('Artigo não encontrado para o slug:', slug);
    throw new articlesErrors.ArticleNotFoundError();
  }

  return article;
};

export const getBlogArticleById = async (id: string, scope: ScopeType) => {
  
  validateEnterpriseScope(scope);

  const article = await BlogArticleModel.findArticleById(id);
  if (!article) {
    throw new articlesErrors.ArticleNotFoundError();
  }

  // Se STANDARD, só pode acessar a própria empresa
  validateStandardAccess(scope, article.enterpriseId);
  
  return article;
};

export const getArticleCreationData = async (id: string, scope: ScopeType) => {
  
  validateEnterpriseScope(scope);
  validateStandardAccess(scope, id);

  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (scope.enterpriseType === 'STANDARD' && id !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const creationData = await BlogArticleModel.findArticleCreationData(id);
    if (!creationData.authors.length && !creationData.categories.length) {
      throw new NotExistData();
    }

    return creationData;
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error(BusinessMessages.article.get.genericError);
  }
};

export const updateBlogArticle = async (
  id: string,
  data: UpdateArticleDTO,
  scope: ScopeType
) => {
  validateEnterpriseScope(scope);

  // 🔍 Busca artigo existente
  const existingArticle = await BlogArticleModel.findArticleById(id);
  if (!existingArticle) {
    throw new articlesErrors.ArticleNotFoundError();
  }

  // 🔒 Valida escopo da empresa
  validateStandardAccess(scope, existingArticle.enterpriseId);

  // ---- Upload da imagem (se enviada novamente) ----
  let imageUrl: string | undefined | null;
  if (data.image?.startsWith("data:image") && existingArticle.enterpriseId) {
    imageUrl = await uploadFileToUploadService(
      data.image,
      existingArticle.enterpriseId,
      data.slug ?? existingArticle.slug
    );
  } else if (data.image !== undefined && data.image !== null) {
    imageUrl = data.image;
  } else {
    imageUrl = existingArticle.image;
  }

  // ---- Processamento do conteúdo ----
  const processedContent = data.content
    ? await processImagesInContent({
        content: data.content,
        recEnterpriseId: existingArticle.enterpriseId,
      })
    : existingArticle.content;

  // ---- Atualiza o artigo ----
  const { authorId, image, categoryId, tagIds, collectionsIds, ...rest } = data;
  const updatedArticle = await BlogArticleModel.updateArticle(id, {
    ...rest,
    ...(authorId && {
      author: { connect: { id: authorId } }
    }),
    image: imageUrl,
    content: processedContent,
  });

  // ---- Recria as relações de taxonomias ----
  const taxonomyIdsToLink: string[] = [];

  if (data.categoryId) taxonomyIdsToLink.push(data.categoryId);
  if (Array.isArray(data.tagIds) && data.tagIds.length > 0) taxonomyIdsToLink.push(...data.tagIds);
  if (Array.isArray(data.collectionsIds) && data.collectionsIds.length > 0) taxonomyIdsToLink.push(...data.collectionsIds);

  const uniqueTaxonomyIds = Array.from(new Set(taxonomyIdsToLink));

  // 🔄 Remove relações antigas e cria novas (sincronização)
  await BlogArticleModel.deleteArticleTaxonomies(id);

  if (uniqueTaxonomyIds.length > 0) {
    await BlogArticleModel.createRelationArticleTaxonomies(id, uniqueTaxonomyIds);
  }

  // 🚀 Redeploy se foi publicado
  if (data.status === "PUBLISHED") {
    triggerEnterpriseRedeploy(existingArticle.enterpriseId).catch(() => {});
  }

  return {
    message: BusinessMessages.article.update.success,
    article: updatedArticle,
  };
};

export const deleteBlogArticle = async (id: string, scope: ScopeType) => {

  validateEnterpriseScope(scope);

  // Verificando se o artigo existe antes de tentar deletá-la
  const article = await BlogArticleModel.findArticleById(id);

  if (!article) {
    throw new ArticleNotFoundError();
  }

  validateStandardAccess(scope, article?.enterpriseId);

  if (article.deletedAt !== null) {
    throw new ArticleAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await BlogArticleModel.softDeleteArticle(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error(BusinessMessages.article.delete.genericError);
    }

    triggerEnterpriseRedeploy(article.enterpriseId).catch((err) => {
      console.error(`Erro ao disparar redeploy para enterprise ${article.enterpriseId}:`, err);
    });

    const message = BusinessMessages.article.delete.success;

    return {
      message, 
      result
    };
  } catch (error) {
    if (error instanceof BlogArticleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error(BusinessMessages.article.delete.genericError);
  }
};

export const getPublicBlogHomeByApiKey = async (
  apiKey: string,
  options: BlogHomeQueryType,
  pagination?: PaginationSchema
) => {
  const AuthApiKeys = await findApiKeyByKey(apiKey);
  if (!AuthApiKeys) throw new ApiKeyNotFoundError();

  const enterpriseId = AuthApiKeys.enterpriseId;
  const contractId = AuthApiKeys.contractId || undefined;

  const promises: Promise<any>[] = [];
  const result: Record<string, any> = {};

  // Função para higienizar
  const cleanArticles = (articles: RawArticle[]): CleanArticle[] => {
    return articles.map((article) => {
      const taxonomies = (article.ArticleTaxonomy ?? []).map((t) => t.taxonomy);

      const { ArticleTaxonomy, ...rest } = article;

      return {
        ...rest,
        taxonomies,
      };
    });
  };

  // ----- TAGS -----
  if (options.listTags) {
    promises.push(
      BlogArticleModel.findTags(enterpriseId, contractId).then(
        (tags) => (result.tags = tags)
      )
    );
  }

  // ----- CATEGORIES -----
  if (options.listCategories) {
    promises.push(
      BlogArticleModel.findCategories(enterpriseId, contractId).then(
        (cats) => (result.categories = cats)
      )
    );
  }

  // ----- AUTHORS -----
  if (options.listAuthors) {
    promises.push(
      BlogArticleModel.findAuthors(enterpriseId).then(
        (authors) => (result.authors = authors)
      )
    );
  }

  // ----- COLLECTIONS -----
  if (options.listCollections && options.listCollections.length > 0) {
    promises.push(
      (async () => {
        const collections = await BlogArticleModel.findCollectionsBySlugs(
          enterpriseId,
          options.listCollections,
          contractId
        );

        const collectionsWithArticles = await Promise.all(
          collections.map(async (col) => {
            const rawArticles = await BlogArticleModel.findArticlesByCollectionSlug(
              enterpriseId,
              col.slug,
              contractId
            );

            return {
              ...col,
              articles: cleanArticles(rawArticles),
            };
          })
        );

        const collectionsObj: Record<string, any> = {};
        options.listCollections.forEach((slug) => {
          const found = collectionsWithArticles.find((c) => c.slug === slug);
          collectionsObj[slug] = found || { articles: [] };
        });

        result.collections = collectionsObj;
      })()
    );
  }

  // ----- NOVOS POSTS -----
  if (options.newPosts) {
    promises.push(
      BlogArticleModel.findPublicAllArticles(
        enterpriseId,
        contractId,
        {},
        { ...pagination, perPage: options.newPosts, page: 1 }
      ).then((articles) => {
        result.newPosts = cleanArticles(articles.data);
      })
    );
  }

  // ----- RECOMMENDED POSTS -----
  if (options.recommendedPosts) {
    promises.push(
      BlogArticleModel.findPublicAllArticles(
        enterpriseId,
        contractId,
        { recommended: true },
        { ...pagination, perPage: options.recommendedPosts, page: 1 }
      ).then((articles) => {
        result.recommendedPosts = cleanArticles(articles.data);
      })
    );
  }

  await Promise.all(promises);

  return result;
};
