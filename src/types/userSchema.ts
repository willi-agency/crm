export interface userCreateDTO {
  name: string;
  email: string;
  password: string;
  roleId: string;
  enterpriseId: string;
}

export interface userUpdateDTO {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
}
