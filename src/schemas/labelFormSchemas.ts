import { z } from 'zod';

export const createLabelFormSchema = z.object({
  name: z
    .string()
    .regex(
      /^[a-z]+([A-Z][a-z0-9]+)*$/,
      'Name deve estar em camelCase e não pode conter hífens, espaços ou caracteres especiais'
    )
    .min(1, 'O name é obrigatório'),
  label: z.string().min(1, 'O label é obrigatório'),
  type: z.string(),
  description: z.string(),
});
export type LabelFormCreateDTO = z.infer<typeof createLabelFormSchema>;

export const updateLabelFormSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getAllLabelFormByNameSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
});

export const getLabelFormByIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
