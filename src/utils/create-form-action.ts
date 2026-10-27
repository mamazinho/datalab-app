import type { z } from 'zod';
import type { ActionState } from '../types/actions';

interface ICreateFormActionOptions {
  invalidMessage?: string;
  // Prepended to the thrown error message
  errorPrefix?: string;
  // Replaces the thrown error message
  errorMessage?: string;
  mapFormData?: (formData: FormData) => unknown;
}

export function createFormAction<TSchema extends z.ZodType, TData>(
  schema: TSchema,
  handler: (data: z.output<TSchema>) => Promise<TData>,
  options: ICreateFormActionOptions = {},
) {
  const {
    invalidMessage = 'Dados inválidos.',
    errorPrefix = '',
    errorMessage,
    mapFormData = (formData: FormData) => Object.fromEntries(formData),
  } = options;

  return async (
    _prevState: ActionState<TData>,
    formData: FormData,
  ): Promise<ActionState<TData>> => {
    const parsed = schema.safeParse(mapFormData(formData));

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || invalidMessage,
        timestamp: Date.now(),
      };
    }

    try {
      const data = await handler(parsed.data as z.output<TSchema>);
      return {
        success: true,
        ...(data !== undefined ? { data } : {}),
        timestamp: Date.now(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage ?? `${errorPrefix}${message}`,
        timestamp: Date.now(),
      };
    }
  };
}
