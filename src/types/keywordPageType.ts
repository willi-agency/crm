export interface KeywordPageCreateDTO {
  keyword: string;
  slug?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  content?: string;
  rawContent?: any;
  enterpriseId: string;
  keywordPageCategoryId?: string;
}

export interface KeywordPageUpdateDTO {
  keyword?: string;
  slug?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  content?: string;
  rawContent?: any;
  enterpriseId?: string;
  keywordPageCategoryId?: string;
}
