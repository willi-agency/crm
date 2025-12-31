import { z } from 'zod';
import { DateField, DecimalField, IdField, NameField, UrlField } from '../common/fields';

// Enums esperados (substitua pelos reais se já existirem):
export enum ContractStatus {
  ACTIVE = 'ACTIVE',        // contrato ativo, tudo liberado
  SUSPENDED = 'SUSPENDED',  // suspensão temporária
  CANCELED = 'CANCELED',    // cancelado definitivamente
  PENDING = 'PENDING',      // aguardando início ou aprovação
}

export enum FinancialStatus {
  OK = 'OK',                // financeiro em dia
  LATE = 'LATE',            // inadimplente
  RENEGOTIATED = 'RENEGOTIATED', // renegociado
  BLOCKED = 'BLOCKED',      // bloqueado (ex: após X dias de inadimplência)
}

export enum ContractType {
  NEW = 'NEW',
  RENEWAL = 'RENEWAL',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME',
}

// ============ CREATE / UPDATE ============
export const createContractSchema = z.object({
  name: NameField,
  type: z.nativeEnum(ContractType).optional(),
  previousId: IdField.optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  financialStatus: z.nativeEnum(FinancialStatus).optional(),
  version: z.number().int().positive().optional(),
  startDate: DateField,
  endDate: DateField.optional(),
  renegotiatedAt: DateField.optional(),
  price: DecimalField,
  currency: z.string().default('BRL'),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  notes: z.string().optional(),
  documentUrl: UrlField.optional(),
  webhookDeploy: z.string().optional(),
  enterpriseId: IdField,
  serviceId: IdField,

  siteDetails: z
    .object({
      url: UrlField.optional(),
      hostingType: z.string().optional(),
      pagesLimit: z.number().int().positive().optional(),
      keywordsLimit: z.number().int().positive().optional(),
      lang: z.string().optional(),
      blogContent: z.boolean().optional(),
    })
    .optional(),
});

export const updateContractSchema = z.object({
  name: z.string().min(1, 'Nome do contrato é obrigatório').optional(),
  code: z.string().min(1, 'Código do contrato é obrigatório').optional(),
  type: z.nativeEnum(ContractType).optional(),
  previousId: IdField.optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  financialStatus: z.nativeEnum(FinancialStatus).optional(),
  version: z.number().int().positive().optional(),
  startDate: DateField.optional(),
  endDate: DateField.optional(),
  renegotiatedAt: DateField.optional(),
  price: DecimalField.optional(),
  currency: z.string().optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  notes: z.string().optional(),
  documentUrl: UrlField.optional(),
  webhookDeploy: z.string().optional(),
  serviceId: IdField.optional(),

  siteDetails: z
    .object({
      url: UrlField.optional(),
      hostingType: z.string().optional(),
      pagesLimit: z.number().int().positive().optional(),
      keywordsLimit: z.number().int().positive().optional(),
      lang: z.string().optional(),
      blogContent: z.boolean().optional(),
    })
    .optional(),
})
.partial();

// ============ GET / FILTER / PAGINAÇÃO ============
export const getAllContractsSchema = z.object({
  enterpriseId: IdField.optional(),
  serviceId: IdField.optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  financialStatus: z.nativeEnum(FinancialStatus).optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  startDate: DateField.optional(),
  endDate: DateField.optional(),
});

export const getContractByIdSchema = z.object({
  id: IdField,
});

export const getContractByCodeSchema = z.object({
  code: z.string().min(1, 'Nome do autor é obrigatório'),
});

export const deleteContractSchema = z.object({
  id: IdField,
});

// ============ TYPES ============
export type CreateContractDTO = z.infer<typeof createContractSchema>;
export type UpdateContractDTO = z.infer<typeof updateContractSchema>;
export type FindContractFilter = z.infer<typeof getAllContractsSchema>;
export type FindContractById = z.infer<typeof getContractByIdSchema>;
