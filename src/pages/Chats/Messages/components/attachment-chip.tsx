import styles from '../messages.module.css';
import type { IPendingAttachment } from '../use-chat-attachments';
import { formatFileSize } from '../../../../utils/download';

interface AttachmentChipProps {
    filename: string;
    size: number;
    status?: IPendingAttachment['status'];
    error?: string;
    onRemove?: () => void;
    isDisabled?: boolean;
}

const STATUS_LABEL: Record<IPendingAttachment['status'], string> = {
    uploading: 'enviando...',
    ready: '',
    error: 'falhou',
};

export const AttachmentChip = ({ filename, size, status = 'ready', error, onRemove, isDisabled }: AttachmentChipProps) => (
    <span className={styles.attachmentChipBox} data-variant={onRemove ? 'input' : 'bubble'} data-failed={status === 'error'} title={error ?? filename}>
        <span className={styles.attachmentName}>📎 {filename}</span>
        <span className={styles.attachmentMeta}>{STATUS_LABEL[status] || formatFileSize(size)}</span>
        {onRemove && (
            <button className={styles.attachmentRemove} type="button" aria-label={`Remover ${filename}`} disabled={isDisabled} onClick={onRemove}>
                ✕
            </button>
        )}
    </span>
);
