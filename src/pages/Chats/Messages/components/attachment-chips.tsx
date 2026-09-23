import type { IChatFileRef } from '../../../../services/datalab-api/chatFilesResource';
import type { IPendingAttachment } from '../../../../hooks/use-chat-attachments';
import { formatFileSize } from '../../../../utils/download';
import { AttachmentChip, AttachmentMeta, AttachmentName, AttachmentRemove } from '../messages.style';

interface PendingAttachmentChipsProps {
    attachments: IPendingAttachment[];
    onRemove: (localId: string) => void;
    isDisabled: boolean;
}

const STATUS_LABEL: Record<IPendingAttachment['status'], string> = {
    uploading: 'enviando...',
    ready: '',
    error: 'falhou',
};

export const PendingAttachmentChips = ({ attachments, onRemove, isDisabled }: PendingAttachmentChipsProps) =>
    attachments.map((attachment) => (
        <AttachmentChip
            key={attachment.localId}
            $variant="input"
            $failed={attachment.status === 'error'}
            title={attachment.error ?? attachment.filename}
        >
            <AttachmentName>📎 {attachment.filename}</AttachmentName>
            <AttachmentMeta>{STATUS_LABEL[attachment.status] || formatFileSize(attachment.size)}</AttachmentMeta>
            <AttachmentRemove
                type="button"
                aria-label={`Remover ${attachment.filename}`}
                disabled={isDisabled}
                onClick={() => onRemove(attachment.localId)}
            >
                ✕
            </AttachmentRemove>
        </AttachmentChip>
    ));

export const SentAttachmentChips = ({ attachments }: { attachments: IChatFileRef[] }) =>
    attachments.map((file) => (
        <AttachmentChip key={file.id} $variant="bubble" title={file.filename}>
            <AttachmentName>📎 {file.filename}</AttachmentName>
            <AttachmentMeta>{formatFileSize(file.size)}</AttachmentMeta>
        </AttachmentChip>
    ));
