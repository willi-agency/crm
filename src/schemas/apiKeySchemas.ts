//src\schemas\apiKeySchemas.ts

import { z } from 'zod';
import { IdField } from './common/fields';

export const createApiKeySchema = z.object({
  enterpriseId: IdField,
  contractId: IdField.optional(),
  description: z.string().optional(),
});

export const getApiKeyByKeySchema = z.object({
  key: z.string().min(10, 'Key inválida'),
});

export const getApiKeyByIdSchema = z.object({
  id: IdField,
});

export const deleteApiKeySchema = z.object({
  id: IdField,
});

export const validateApiKeySchema = z.object({
  apiKey: z.string().length(69, 'Key inválida'),
});

export type CreateApiKeyDTO = z.infer<typeof createApiKeySchema>;