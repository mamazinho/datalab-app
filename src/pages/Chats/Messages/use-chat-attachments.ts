import { useCallback, useState } from 'react';
import axios from 'axios';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IChatFileRef } from '../../../services/datalab-api/chatFilesResource';
import type { UUID } from '../../../types/ids';

export interface IPendingAttachment {
  localId: string;
  filename: string;
  size: number;
  status: 'uploading' | 'ready' | 'error';
  file?: IChatFileRef;
  error?: string;
}

let attachmentCounter = 0;

const REJECTION_BY_STATUS: Record<number, string> = {
  400: 'Arquivo vazio.',
  413: 'Arquivo grande demais (limite: 10MB para PDF e imagem, 200KB para texto).',
  415: 'Tipo de arquivo não suportado. Envie PDF, imagem ou texto.',
};

const getErrorMessage = (error: unknown): string =>
  (axios.isAxiosError(error) && error.response && REJECTION_BY_STATUS[error.response.status])
  || 'Falha ao enviar o arquivo.';

export const useChatAttachments = (chatId: UUID) => {
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
        update(localId, { status: 'error', error: getErrorMessage(error) });
      }
    }));
  };

  const remove = useCallback((localId: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.localId !== localId));
  }, []);

  const clear = useCallback(() => setAttachments([]), []);

  const readyFiles = attachments.flatMap((attachment) => (attachment.file ? [attachment.file] : []));
  const isUploading = attachments.some((attachment) => attachment.status === 'uploading');

  return { attachments, readyFiles, isUploading, addFiles, remove, clear };
};
