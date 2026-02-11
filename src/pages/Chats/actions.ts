import { DatalabAPI } from "../../services/datalab-api";
import type { IRetrieveChat } from "../../services/datalab-api/chatsResource";
import type { ActionState } from "../../types/actions";

export async function createChatAction(
  _prevState: ActionState<IRetrieveChat>,
  formData: FormData,
): Promise<ActionState<IRetrieveChat>> {
  const title = formData.get("title") as string;

  if (!title || title.trim() === "") {
    return {
      success: false,
      error: "O título do chat é obrigatório",
      timestamp: Date.now(),
    };
  }

  try {
    const data = await DatalabAPI.ChatsResource.createChat({ title });
    return {
      success: true,
      data: data,
      timestamp: Date.now(),
    };
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Falha ao criar chat: ${error.message}`,
        timestamp: Date.now(),
      };
    }
    return {
      success: false,
      error: `Falha ao criar chat: ${String(error)}`,
      timestamp: Date.now(),
    };
  }
}
