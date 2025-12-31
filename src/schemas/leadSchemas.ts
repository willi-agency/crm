import { z } from 'zod';

export const createLeadSchema = z.object({
  apiKey: z.string().length(69, 'Token inválido'),
  dataFormId: z.string(),
  userAgent: z.union([z.string(), z.record(z.any())]).optional(),
  dataValues: z.record(z.string(), z.string()), // Chave: labelName, Valor: string
});

export type CreateLeadDTO = z.infer<typeof createLeadSchema>;

export const getByPipelineSchema = z.object({
  enterpriseId: z.string().uuid('ID inválido'),
  pipelineId: z.string().uuid('ID inválido'),
});