import { z } from 'zod';

export const syncPayloadSchema = z.object({
  type: z.enum(['points', 'exp', 'coins']),
  amount: z.number().min(0),
  game: z.string().optional(),
});

export type SyncPayload = z.infer<typeof syncPayloadSchema>;
