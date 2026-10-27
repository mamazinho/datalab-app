import { axiosCompanyInstance } from "./axios";
import type { UUID7 } from "../../types/ids";

export interface IChatFileRef {
  id: UUID7;
  filename: string;
  media_type: string;
  size: number;
}

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/*',
  'application/json',
  'application/xml',
  'application/yaml',
  'application/x-yaml',
].join(',');

export const ChatFilesResource = {
  async uploadFile(chatId: UUID7, file: File): Promise<IChatFileRef> {
    const formData = new FormData();
    formData.append('file', file);

    // Without overriding the instance's JSON Content-Type, axios serializes the FormData as JSON
    const response = await axiosCompanyInstance.post(`chats/${chatId}/files/`, formData, {
      adapter: 'fetch',
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as IChatFileRef;
  },

  async downloadFile(chatId: UUID7, fileId: UUID7): Promise<Blob> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/files/${fileId}/download/`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
