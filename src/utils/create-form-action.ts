import type { z } from 'zod';
import type { ActionState } from '../types/actions';
import { ApiError } from './api-error';

interface ICreateFormActionOptions {
  invalidMessage?: string;
  mapFormData?: (formData: FormData) => unknown;
}

export function createFormAction<TSchema extends z.ZodType, TData>(
  schema: TSchema,
  handler: (data: z.output<TSchema>) => Promise<TData>,
  options: ICreateFormActionOptions = {},
) {
  const {
    invalidMessage = 'Dados inválidos.',
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
      const { friendly_message, traceId, detail } = ApiError.from(error);
      return {
        success: false,
        error: friendly_message,
        errorDetail: detail,
        traceId,
        timestamp: Date.now(),
      };
    }
  };
}
