import { useState } from 'react';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IFileCardItem } from '../../../../utils/chat-timeline';
import { formatFileSize, saveBlob } from '../../../../utils/download';
import type { UUID } from '../../../../types/ids';
import {
    FileCard as FileCardBox,
    FileCardDownload,
    FileCardIcon,
    FileCardInfo,
    FileCardMeta,
    FileCardName,
    FileCardRow,
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

export const FileCard = ({ chatId, item }: FileCardProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setIsDownloading(true);
        setError(null);
        try {
            const blob = await DatalabAPI.ChatFilesResource.downloadFile(chatId, item.file.id);
            saveBlob(blob, item.file.filename);
        } catch {
            setError(DOWNLOAD_ERROR);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <FileCardRow>
            <FileCardBox>
                <FileCardIcon aria-hidden>{ICON_BY_TYPE[item.file.media_type] ?? '📄'}</FileCardIcon>
                <FileCardInfo>
                    <FileCardName title={item.file.filename}>{item.file.filename}</FileCardName>
                    <FileCardMeta>{error ?? formatFileSize(item.file.size)}</FileCardMeta>
                </FileCardInfo>
                <FileCardDownload type="button" disabled={isDownloading} onClick={() => void handleDownload()}>
                    {isDownloading ? 'Baixando...' : 'Baixar'}
                </FileCardDownload>
            </FileCardBox>
        </FileCardRow>
    );
};
