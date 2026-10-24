import styles from '../messages.module.css';
import { useActionState } from 'react';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IChatFileRef } from '../../../../services/datalab-api/chatFilesResource';
import { formatFileSize, saveBlob } from '../../../../utils/download';
import type { UUID7 } from '../../../../types/ids';

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
        <form className={styles.fileCardForm} action={download}>
            <span className={styles.fileCardIcon} aria-hidden>{ICON_BY_TYPE[file.media_type] ?? '📄'}</span>
            <div className={styles.fileCardInfo}>
                <div className={styles.fileCardName} title={file.filename}>{file.filename}</div>
                <div className={styles.fileCardMeta}>{error ?? formatFileSize(file.size)}</div>
            </div>
            <button className={styles.fileCardDownload} type="submit" disabled={isDownloading}>
                {isDownloading ? 'Baixando...' : 'Baixar'}
            </button>
        </form>
    );
};
