// src/schemas/enterpriseSchemas.ts
import { z } from 'zod';

export const mapCoverageSchema = z.object({
  countries: z.array(
    z.object({
      country: z.string(),
      states: z.array(
        z.object({
          state: z.string(),
          cities: z.array(
            z.object({
              city: z.string(),
              districts: z.array(z.string()),
            })
          ),
        })
      ),
    })
  ),
});

// Schema para criação de empresa
export const createEnterpriseSchema = z.object({
  name: z.string().min(3, 'O nome da empresa deve ter no mínimo 3 caracteres'),
  cnpj: z
    .string()
    .length(14, 'CNPJ deve conter exatamente 14 dígitos numéricos')
    .regex(/^\d{14}$/, 'CNPJ deve conter apenas números'),
  logo: z.string().url('Precisa ser uma URL válida').optional(),
  briefing: z.string().optional(),
  webhookDeploy: z.string().url().optional(),
  addressCity: z.string().optional(),
  addressComplement: z.string().optional(),
  addressCountry: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressNumber: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressState: z.string().optional(),
  addressStreet: z.string().optional(),
  corporateReason: z.string().optional(),
  domain: z.string().optional(),
  responsible: z.string().optional(),
  MapCoverage: mapCoverageSchema.optional().nullable(),
});

// Schema para atualizar empresa
export const updateEnterpriseSchema = z.object({
  name: z.string().min(3, 'O nome da empresa deve ter no mínimo 3 caracteres').optional(),
  cnpj: z
    .string()
    .length(14, 'CNPJ deve conter exatamente 14 dígitos numéricos')
    .regex(/^\d{14}$/, 'CNPJ deve conter apenas números')
    .optional(),
  logo: z.string().url('Precisa ser uma URL válida').optional(),
  webhookDeploy: z.string().optional(),
  briefing: z.string().optional(),
  addressCity: z.string().optional(),
  addressComplement: z.string().optional(),
  addressCountry: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressNumber: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressState: z.string().optional(),
  addressStreet: z.string().optional(),
  corporateReason: z.string().optional(),
  domain: z.string().optional(),
  responsible: z.string().optional(),
  MapCoverage: mapCoverageSchema.optional().nullable(),
});

// Schema para buscar empresa por ID
export const getEnterpriseByIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getEnterpriseAllDataByIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
  params: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) =>
      typeof val === 'string'
        ? val.split(',').filter(Boolean)
        : Array.isArray(val)
          ? val
          : []
    ),
});

// Schema para buscar empresa por CNPJ
export const getAllEnterpriseByCnpjSchema = z.object({
  cnpj: z
    .string()
    .length(14, 'CNPJ deve conter exatamente 14 dígitos numéricos')
    .regex(/^\d{14}$/, 'CNPJ deve conter apenas números'),
});


export type EnterpriseCreateDTO = z.infer<typeof createEnterpriseSchema>;
export type EnterpriseUpdateDTO = z.infer<typeof updateEnterpriseSchema>;