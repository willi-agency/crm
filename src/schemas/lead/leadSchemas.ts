import { z } from "zod";
import { IdField } from "../common/fields";

// Filtros de LeadSubmit e LeadData
export const getAllLeadsSchema = z.object({
  enterpriseId: IdField.optional(),
  dataFormId: IdField.optional(),
  contractId: IdField.optional(),
  currentPipelineStageId: IdField.optional(),
});

export const LeadSubmitCreateSchema = z.object({
  enterpriseId: IdField,
  dataFormId: z.string(),
  userAgent: z.any().optional(), // equivalente ao PrismaJson
  dataValues: z.record(z.string()), // Record<string, string>
});

export type LeadSubmitInternalCreateDTO = z.infer<typeof LeadSubmitCreateSchema>;
export type LeadFilterType = z.infer<typeof getAllLeadsSchema>;
