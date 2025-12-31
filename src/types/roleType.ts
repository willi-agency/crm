export interface RoleCreateDTO {
  name: string;
  enterpriseId?: string;
  permissions: string[];
}

export interface RoleUpdateDTO {
  name?: string;
  enterpriseId?: string;
  permissions?: string[];
}
