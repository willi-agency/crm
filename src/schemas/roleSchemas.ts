import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Nome da Role é obrigatório'),
  permissions: z.array(z.string()),
  enterpriseId: z.string(),
});
export type CreateRoleSchemaDTO = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Nome da Role é obrigatório').optional(),
  permissions: z.array(z.string()).optional(),
  enterpriseId: z.string().optional(),
});

export type UpdateRoleSchemaDTO = z.infer<typeof updateRoleSchema>;

export const getRoleByIdSchema = z.object({
  id: z.string().min(1, 'Id é obrigatório').uuid('ID inválido'),
});

export const getRoleByEnterpriseIdSchema = z.object({
  enterpriseId: z.string().min(1, 'Id é obrigatório').uuid('ID inválido'),
});

export const deleteRoleSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
