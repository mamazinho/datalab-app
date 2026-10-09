import { useActionState } from 'react';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IChatFileRef } from '../../../../services/datalab-api/chatFilesResource';
import { formatFileSize, saveBlob } from '../../../../utils/download';
import type { UUID7 } from '../../../../types/ids';
import {
    FileCardDownload,
    FileCardForm,
    FileCardIcon,
    FileCardInfo,
    FileCardMeta,
    FileCardName,
} from '../messages.style';

interface FileCardProps {
    chatId: UUID7;
    file: IChatFileRef;
}

const ICON_BY_TYPE: Record<string, string> = {
    'application/pdf': '📕',
    'text/csv': '📊',
    'text/markdown': '📝',
    'application/json': '🧾',
    'text/html': '🌐',
};

const DOWNLOAD_ERROR = 'Não foi possível baixar o arquivo. Tente novamente.';

export const FileCard = ({ chatId, file }: FileCardProps) => {
    const [error, download, isDownloading] = useActionState(async () => {
        try {
            saveBlob(await DatalabAPI.ChatFilesResource.downloadFile(chatId, file.id), file.filename);
            return null;
        } catch {
            return DOWNLOAD_ERROR;
        }
    }, null);

    return (
        <FileCardForm action={download}>
            <FileCardIcon aria-hidden>{ICON_BY_TYPE[file.media_type] ?? '📄'}</FileCardIcon>
            <FileCardInfo>
                <FileCardName title={file.filename}>{file.filename}</FileCardName>
                <FileCardMeta>{error ?? formatFileSize(file.size)}</FileCardMeta>
            </FileCardInfo>
            <FileCardDownload type="submit" disabled={isDownloading}>
                {isDownloading ? 'Baixando...' : 'Baixar'}
            </FileCardDownload>
        </FileCardForm>
    );
};
