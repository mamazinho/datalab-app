import { DatalabAPI } from "../../services/datalab-api";
import type { IRetrieveChat } from "../../services/datalab-api/chatsResource";
import type { ActionState } from "../../types/actions";
import { createChatSchema } from "./schemas";

export async function createChatAction(
  _prevState: ActionState<IRetrieveChat>,
  formData: FormData,
): Promise<ActionState<IRetrieveChat>> {
  const parsed = createChatSchema.safeParse({
    title: formData.get("title") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      timestamp: Date.now(),
    };
  }

  try {
    const data = await DatalabAPI.ChatsResource.createChat(parsed.data);
    return {
      success: true,
      data: data,
      timestamp: Date.now(),
    };
  } catch (error: Error | unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Falha ao criar chat: ${message}`,
      timestamp: Date.now(),
    };
  }
}
