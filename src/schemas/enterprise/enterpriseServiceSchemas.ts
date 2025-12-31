//src/models/enterprise/enterpriseServiceModel.ts

import { z } from 'zod';
import { IdField, JsonField, NameField } from '../common/fields';

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// ============ CREATE / UPDATE ============
export const createServiceSchema = z.object({
  name: NameField,
  description: z.string().optional(),
  status: z.nativeEnum(ServiceStatus).default(ServiceStatus.ACTIVE),
  version: z.number().int().positive().optional(),
  config: JsonField.optional(),
});

export const updateServiceSchema = z
  .object({
    name: NameField.optional(),
    description: z.string().optional(),
    status: z.nativeEnum(ServiceStatus).optional(),
    version: z.number().int().positive().optional(),
    config: JsonField.optional(),
  })
  .partial();

// ============ GET / FILTER / PAGINAÇÃO ============

export const getAllServicesSchema = z.object({
  enterpriseId: IdField.optional(),
  name: NameField.optional(),
  status: z.nativeEnum(ServiceStatus).optional(),
});

export const getServiceByIdSchema = z.object({
  id: IdField,
});

export const deleteServiceSchema = z.object({
  id: IdField,
});

// ============ TYPES ============

export type CreateServiceDTO = z.infer<typeof createServiceSchema>;
export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;
export type FindServiceFilter = z.infer<typeof getAllServicesSchema>;
export type FindServiceById = z.infer<typeof getServiceByIdSchema>;
