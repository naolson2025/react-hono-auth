import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const userSettingsSchema = z.object({
  favorite_color: z.string().optional(),
  favorite_animal: z.string().optional(),
});

export const userSettingsValidator = zValidator('json', userSettingsSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        errors: result.error.issues.map((issue) => issue.message),
      },
      400
    );
  }
});
