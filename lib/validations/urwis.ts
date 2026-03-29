import { z } from 'zod';

export const urwisActionSchema = z.enum(['feed', 'play', 'wash', 'wash_all', 'heal', 'sleep']);

export const urwisInteractSchema = z.object({
  actionType: urwisActionSchema,
});

export type UrwisAction = z.infer<typeof urwisActionSchema>;
