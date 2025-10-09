import { ChatsResource } from "./chatsResource";
import { ChatMessagesResource } from "./chatMessagesResource";
export * from "./chatsResource";
export * from "./chatMessagesResource";

export const DatalabAPI = {
  ...ChatsResource,
  ...ChatMessagesResource,
};