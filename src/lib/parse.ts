import type { ZodError, ZodSchema } from 'zod';

export function zodErrorPayload(err: ZodError) {
  return {
    message: 'Validation failed',
    issues: err.flatten(),
  };
}

export function tryParse<T>(schema: ZodSchema<T>, data: unknown): { ok: true; value: T } | { ok: false; payload: ReturnType<typeof zodErrorPayload> } {
  const r = schema.safeParse(data);
  if (!r.success) return { ok: false, payload: zodErrorPayload(r.error) };
  return { ok: true, value: r.data };
}
