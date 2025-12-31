// src/schemas/leadPipelineListSchemas.ts
import { z } from 'zod';

// Schema para criação de pipelineList
export const createLeadPipelineListSchema = z.object({
  leadId: z.string(),
  pipelineStageId: z.string(),
});
export type LeadPipelineListCreateDTO = z.infer<typeof createLeadPipelineListSchema>;
