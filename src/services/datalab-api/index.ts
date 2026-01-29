import { ChatsResource } from "./chatsResource";
import { ChatMessagesResource } from "./chatMessagesResource";
import { UsersResource } from "./usersResource";
export * from "./chatsResource";
export * from "./chatMessagesResource";

export const DatalabAPI = {
  ...ChatsResource,
  ...ChatMessagesResource,
  ...UsersResource,
};