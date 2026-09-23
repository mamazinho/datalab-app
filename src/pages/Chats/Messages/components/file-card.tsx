import { useActionState } from 'react';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IFileCardItem } from '../../../../utils/chat-timeline';
import { formatFileSize, saveBlob } from '../../../../utils/download';
import type { UUID } from '../../../../types/ids';
import {
    Bubble,
    FileCardDownload,
    FileCardForm,
    FileCardIcon,
    FileCardInfo,
    FileCardMeta,
    FileCardName,
    MessageRow,
} from '../messages.style';

interface FileCardProps {
    chatId: UUID;
    item: IFileCardItem;
}

const ICON_BY_TYPE: Record<string, string> = {
    'application/pdf': '📕',
    'text/csv': '📊',
    'text/markdown': '📝',
    'application/json': '🧾',
    'text/html': '🌐',
};

const DOWNLOAD_ERROR = 'Não foi possível baixar o arquivo. Tente novamente.';

export const FileCard = ({ chatId, item: { file } }: FileCardProps) => {
    const [error, download, isDownloading] = useActionState(async () => {
        try {
            saveBlob(await DatalabAPI.ChatFilesResource.downloadFile(chatId, file.id), file.filename);
            return null;
        } catch {
            return DOWNLOAD_ERROR;
        }
    }, null);

    return (
        <MessageRow $isUser={false}>
            <Bubble $isUser={false}>
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
            </Bubble>
        </MessageRow>
    );
};
