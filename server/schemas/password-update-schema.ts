import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(10, {
    message: 'Current password must be at least 10 characters long',
  }),
  newPassword: z
    .string()
    .min(10, { message: 'Password must be at least 10 characters long' }),
});

export const passwordUpdateValidator = zValidator(
  'json',
  passwordUpdateSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          errors: result.error.issues.map((issue) => issue.message),
        },
        400
      );
    }
  }
);
