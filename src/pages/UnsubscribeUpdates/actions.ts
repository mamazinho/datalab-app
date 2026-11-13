import { z } from 'zod';
import { DatalabAPI } from '../../services/datalab-api';
import { createFormAction } from '../../utils/create-form-action';

const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Este link de descadastro está incompleto. Use o link do e-mail.'),
});

export const unsubscribeAction = createFormAction(unsubscribeSchema, ({ token }) =>
  DatalabAPI.TrackingResource.unsubscribeUpdates(token),
);
