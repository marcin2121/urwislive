import { z } from 'zod';

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export const sendAllPushSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  message: z.string().min(1, "Message is required").max(1000),
  topic: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")).or(z.null()),
});

export type SendAllPushInput = z.infer<typeof sendAllPushSchema>;
