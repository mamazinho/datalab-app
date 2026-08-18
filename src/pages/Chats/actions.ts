import { DatalabAPI } from "../../services/datalab-api";
import { createFormAction } from "../../utils/create-form-action";
import { createChatSchema } from "./schemas";

export const createChatAction = createFormAction(
  createChatSchema,
  (payload) => DatalabAPI.ChatsResource.createChat(payload),
  { errorPrefix: 'Falha ao criar chat: ' },
);
