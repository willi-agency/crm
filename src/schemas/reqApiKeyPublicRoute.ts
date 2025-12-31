import { z } from 'zod';

export const reqApiKey = z.object({
  apiKey: z.string().length(69, 'Token inválido'),
});
