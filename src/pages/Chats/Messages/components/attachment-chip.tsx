import type { IPendingAttachment } from '../use-chat-attachments';
import { formatFileSize } from '../../../../utils/download';
import { AttachmentChipBox, AttachmentMeta, AttachmentName, AttachmentRemove } from '../messages.style';

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
    <AttachmentChipBox $variant={onRemove ? 'input' : 'bubble'} $failed={status === 'error'} title={error ?? filename}>
        <AttachmentName>📎 {filename}</AttachmentName>
        <AttachmentMeta>{STATUS_LABEL[status] || formatFileSize(size)}</AttachmentMeta>
        {onRemove && (
            <AttachmentRemove type="button" aria-label={`Remover ${filename}`} disabled={isDisabled} onClick={onRemove}>
                ✕
            </AttachmentRemove>
        )}
    </AttachmentChipBox>
);
