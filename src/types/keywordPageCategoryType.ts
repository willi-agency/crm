// types/keywordPageCategoryType.ts

export interface keywordPageCategoryCreateDTO {
  name: string;
  slug: string;
  enterpriseId: string;
}

export interface keywordPageCategoryUpdateDTO {
  name?: string;
  slug?: string;
  enterpriseId: string;
}
