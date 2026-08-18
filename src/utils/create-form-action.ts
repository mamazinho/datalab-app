import type { z } from 'zod';
import type { ActionState } from '../types/actions';

interface ICreateFormActionOptions {
  /** Fallback quando o zod reprova e a issue não tem mensagem própria */
  invalidMessage?: string;
  /** Prefixo do erro quando o handler lança (ex.: "Falha no login: ") */
  errorPrefix?: string;
  /** Erro fixo quando o handler lança (substitui a mensagem original) */
  errorMessage?: string;
  /** Como extrair o input do FormData (default: Object.fromEntries) */
  mapFormData?: (formData: FormData) => unknown;
}

/**
 * Cria uma form action (useActionState) a partir de um schema zod:
 * valida o FormData, executa o handler com os dados tipados e devolve
 * um ActionState — todo formulário passa por zod por construção.
 */
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
