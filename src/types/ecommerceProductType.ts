// types/ecommerceProductType.ts

export interface EcommerceProductCreateDTO {
  name: string;
  slug: string;
  enterpriseId: string;

  description?: string;
  price?: number;
  sku?: string;
  categoryId?: string;
  enabled?: boolean;
  visible?: boolean;
}

export interface EcommerceProductUpdateDTO {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  sku?: string;
  categoryId?: string;
  
  enabled?: boolean;
  visible?: boolean;
}

export interface EcommerceProductImageCreateDTO {
  url: string;
  altText: string;
  order: number;
  productId: string;
}

export interface EcommerceProductImageUpdateDTO {
  url?: string;
  altText?: string;
  order?: number;
  productId?: string;
}