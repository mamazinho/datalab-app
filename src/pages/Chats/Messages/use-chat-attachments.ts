import { useState } from 'react';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IChatFileRef } from '../../../services/datalab-api/chatFilesResource';
import type { UUID7 } from '../../../types/ids';
import { ApiError } from '../../../utils/api-error';

export interface IPendingAttachment {
  localId: string;
  filename: string;
  size: number;
  status: 'uploading' | 'ready' | 'error';
  file?: IChatFileRef;
  error?: string;
}

let attachmentCounter = 0;

export const useChatAttachments = (chatId: UUID7) => {
  const [attachments, setAttachments] = useState<IPendingAttachment[]>([]);

  const update = (localId: string, changes: Partial<IPendingAttachment>) =>
    setAttachments((current) =>
      current.map((attachment) => (attachment.localId === localId ? { ...attachment, ...changes } : attachment)),
    );

  const addFiles = async (files: File[]) => {
    await Promise.all(files.map(async (file) => {
      const localId = `attachment-${++attachmentCounter}`;
      setAttachments((current) => [...current, { localId, filename: file.name, size: file.size, status: 'uploading' }]);

      try {
        const uploaded = await DatalabAPI.ChatFilesResource.uploadFile(chatId, file);
        update(localId, { status: 'ready', file: uploaded });
      } catch (error) {
        update(localId, { status: 'error', error: ApiError.from(error).friendly_message });
      }
    }));
  };

  const remove = (localId: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.localId !== localId));
  };

  const clear = () => setAttachments([]);

  const restore = (files: IChatFileRef[]) =>
    setAttachments((current) => [
      ...files.map((file) => ({
        localId: `attachment-${++attachmentCounter}`,
        filename: file.filename,
        size: file.size,
        status: 'ready' as const,
        file,
      })),
      ...current,
    ]);

  const readyFiles = attachments.flatMap((attachment) => (attachment.file ? [attachment.file] : []));
  const isUploading = attachments.some((attachment) => attachment.status === 'uploading');

  return { attachments, readyFiles, isUploading, addFiles, remove, clear, restore };
};
