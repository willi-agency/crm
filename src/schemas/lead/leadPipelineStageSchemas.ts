// src/schemas/leadPipelineSchemas.ts
import { z } from 'zod';

// Schema para criação de pipeline
export const createLeadPipelineStageSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome da pipeline deve ter no mínimo 2 caracteres'),
  order: z
    .number(),
  pipelineId: z.string(),
});
export type LeadPipelineStageCreateDTO = z.infer<typeof createLeadPipelineStageSchema>;

// Schema para atualização de stage da pipeline
export const singleStageUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  order: z.number().optional(),
})

// Schema de múltiplos updates
export const updateLeadPipelineStagesSchema = z.array(singleStageUpdateSchema);
export type LeadPipelineStagesUpdateDTO = z.infer<typeof updateLeadPipelineStagesSchema>

// Schema para obter pipeline por ID (valida params da rota)
export const getLeadPipelineStageByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema para obter pipeline por ID (valida params da rota)
export const getLeadPipelineStageByPipelineIdSchema = z.object({
  pipelineId: z.string().uuid(),
});

// Schema para query de listagem/filtro de pipelines
export const getAllLeadPipelineStagesSchema = z.object({
  name: z.string().optional(),
  order: z.number().optional(),
  pipelineId: z.string().optional(),
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val), z.number().int().positive().default(1)),
  perPage: z.preprocess((val) => Number(val), z.number().int().positive().default(20)),
});
