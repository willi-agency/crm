//src\types\apiKeyType.ts
export interface ApiKeyCreateDTO {
  description?: string;
  enterpriseId: string;
}

export interface ApiKeyUpdateDTO {
  key?: string;
  enterpriseId?: string;
  description?: string;
  revoked?: boolean;
}
