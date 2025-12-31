import { z } from 'zod';

export const mapCoverageDTO = z.object({
  id: z.string().uuid({ message: "O ID é inválido." }),
});
