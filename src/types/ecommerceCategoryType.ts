// types/ecommerceCategoryType.ts

export interface ecommerceCategoryCreateDTO {
  name: string;
  slug: string;
  enterpriseId: string;
  parentId?: string;
}

export interface ecommerceCategoryUpdateDTO {
  name?: string;
  slug?: string;
  parentId?: string;
  enterpriseId: string;
}
