export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface BlogArticleCreateDTO {
  title: string;
  slug: string;
  description: string;
  content: string;
  image?: string;
  authorId: string;
  categoryId?: string;
  rawContent?: any;
  datePublished?: string;
  status?: ArticleStatus;
  tagIds?: string[];
  enterpriseId: string;
  contractId?: string;
}

export interface BlogArticleUpdateDTO {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  image?: string;
  authorId?: string;
  categoryId?: string;
  datePublished?: string;
  status?: ArticleStatus;
  tagIds?: string[];
  enterpriseId?: string;
}
