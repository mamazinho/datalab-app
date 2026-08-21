import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { INITIAL_ACTION_STATE } from '../types/actions';
import { createFormAction } from './create-form-action';

const loginSchema = z.object({
  email: z.email('E-mail inválido.'),
  password: z.string().min(8, 'Senha muito curta.'),
});

const buildFormData = (entries: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(entries).forEach(([key, value]) => formData.append(key, value));
  return formData;
};

const validForm = buildFormData({ email: 'user@datalab.com', password: 'Senha@123' });

describe('createFormAction', () => {
  it('validates the FormData and calls the handler with typed data', async () => {
    const handler = vi.fn().mockResolvedValue({ id: '1' });
    const action = createFormAction(loginSchema, handler);

    const state = await action(INITIAL_ACTION_STATE, validForm);

    expect(handler).toHaveBeenCalledWith({ email: 'user@datalab.com', password: 'Senha@123' });
    expect(state).toMatchObject({ success: true, data: { id: '1' } });
  });

  it('skips the handler when zod rejects and returns the first message', async () => {
    const handler = vi.fn();
    const action = createFormAction(loginSchema, handler);

    const state = await action(INITIAL_ACTION_STATE, buildFormData({ email: 'nao-e-email', password: '123' }));

    expect(handler).not.toHaveBeenCalled();
    expect(state.success).toBe(false);
    expect(state.error).toBe('E-mail inválido.');
  });

  it('omits data when the handler returns nothing', async () => {
    const action = createFormAction(loginSchema, async () => undefined);

    const state = await action(INITIAL_ACTION_STATE, validForm);

    expect(state.success).toBe(true);
    expect(state).not.toHaveProperty('data');
  });

  it('prefixes the error thrown by the handler', async () => {
    const action = createFormAction(
      loginSchema,
      async () => {
        throw new Error('credenciais inválidas');
      },
      { errorPrefix: 'Falha no login: ' },
    );

    const state = await action(INITIAL_ACTION_STATE, validForm);

    expect(state).toMatchObject({ success: false, error: 'Falha no login: credenciais inválidas' });
  });

  it('replaces the handler message when errorMessage is fixed', async () => {
    const action = createFormAction(
      loginSchema,
      async () => {
        throw new Error('detalhe interno do backend');
      },
      { errorMessage: 'Não foi possível entrar.' },
    );

    const state = await action(INITIAL_ACTION_STATE, validForm);

    expect(state.error).toBe('Não foi possível entrar.');
  });

  it('uses mapFormData when the input is not a plain Object.fromEntries', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const action = createFormAction(z.object({ tags: z.array(z.string()) }), handler, {
      mapFormData: (formData) => ({ tags: formData.getAll('tags') }),
    });

    await action(INITIAL_ACTION_STATE, buildFormData({ tags: 'a' }));

    expect(handler).toHaveBeenCalledWith({ tags: ['a'] });
  });

  it('stamps a timestamp so the feedback effect fires on every submit', async () => {
    const action = createFormAction(loginSchema, async () => undefined);

    const state = await action(INITIAL_ACTION_STATE, validForm);

    expect(state.timestamp).toBeGreaterThan(INITIAL_ACTION_STATE.timestamp);
  });
});
