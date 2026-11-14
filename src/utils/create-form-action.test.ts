import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { buildApiError } from '../test/factories';
import { INITIAL_ACTION_STATE } from '../types/actions';
import { ApiError } from './api-error';
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

  it('returns the friendly message and the support code of the failure', async () => {
    const action = createFormAction(loginSchema, async () => {
      throw new ApiError(buildApiError({ friendly_message: 'E-mail ou senha inválidos.' }), 'trace-1');
    });

    const state = await action(INITIAL_ACTION_STATE, validForm);

    expect(state).toMatchObject({ success: false, error: 'E-mail ou senha inválidos.', traceId: 'trace-1' });
  });

  it('keeps the detail of the failure for forms that point each problem at its field', async () => {
    const detail = { missing_ids: [{ key: 'meta_pixel_id' }] };
    const action = createFormAction(loginSchema, async () => {
      throw new ApiError(buildApiError({ detail }));
    });

    const state = await action(INITIAL_ACTION_STATE, validForm);

    expect(state.errorDetail).toEqual(detail);
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
