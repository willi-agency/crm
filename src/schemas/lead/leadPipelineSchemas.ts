// src/schemas/leadPipelineSchemas.ts
import { z } from 'zod';

// Schema para criação de pipeline
export const createLeadPipelineSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome da pipeline deve ter no mínimo 2 caracteres'),
  description: z
    .string()
    .min(2, 'A descrição da pipeline deve ter no mínimo 2 caracteres'),
  enterpriseId: z.string(),
});
export type LeadPipelineCreateDTO = z.infer<typeof createLeadPipelineSchema>;

// Schema para atualização de pipeline
export const updateLeadPipelineSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});
export type LeadPipelineUpdateDTO = z.infer<typeof updateLeadPipelineSchema>;

// Schema para obter pipeline por ID (valida params da rota)
export const getLeadPipelineByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema para query de listagem/filtro de pipelines
export const getAllLeadPipelinesSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  enterpriseId: z.string().optional(),
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val), z.number().int().positive().default(1)),
  perPage: z.preprocess((val) => Number(val), z.number().int().positive().default(20)),
});
