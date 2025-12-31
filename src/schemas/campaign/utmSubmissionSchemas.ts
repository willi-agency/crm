import { z } from 'zod';
import { IdField, UrlField } from '../common/fields';

// Enum para os campos válidos de UTM
export const validUtmFields = z.enum([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_type',
  'utm_variant',
  'utm_team',
]);

export const utmEntrySchema = z.object({
  utmField: validUtmFields,
  utmValue: z.string().min(1),
});

export const createUtmSubmissionSchema = z.object({
  baseUrl: UrlField,
  enterpriseId: IdField,
  contractId: IdField.optional(),
  fields: z
    .array(utmEntrySchema)
    .min(1, "Deve conter pelo menos um campo de UTM"),
});

export const checkSimilaritySchema = z.object({
  baseUrl: UrlField,
  enterpriseId: IdField,
  contractId: IdField.optional(),
  fields: z
    .array(utmEntrySchema)
    .min(1, "Deve conter pelo menos um campo de UTM"),
});


// Atualizar (só permite alterar os fields, não o dono)
export const updateUtmSubmissionSchema = z.object({
  fields: z
    .array(
      z.object({
        utmField: z.string().min(1),
        utmValue: z.string().min(1),
      })
    )
    .optional(),
}).partial();

// Filtro de listagem
export const getAllUtmSubmissionsSchema = z.object({
  enterpriseId: IdField.optional(),
  contractId: IdField.optional(),
  createdById: IdField.optional(),

  utmField: z.string().optional(),
  utmValue: z.string().optional(),
});

export const getUtmSubmissionByIdSchema = z.object({
  id: IdField,
});

export const deleteUtmSubmissionSchema = z.object({
  id: IdField,
});

// Types
export type CreateUtmSubmissionDTO = z.infer<typeof createUtmSubmissionSchema>;
export type UpdateUtmSubmissionDTO = z.infer<typeof updateUtmSubmissionSchema>;
export type UtmSubmissionFilterType = z.infer<typeof getAllUtmSubmissionsSchema>;
export type FindByIdUtmSubmission = z.infer<typeof getUtmSubmissionByIdSchema>;
export type CheckSimilarityInput = z.infer<typeof checkSimilaritySchema>;
