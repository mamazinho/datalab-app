import styles from '../messages.module.css';
import { useRef, type ReactNode } from 'react';
import type { IPendingAttachment } from '../use-chat-attachments';
import { ACCEPTED_FILE_TYPES } from '../../../../services/datalab-api/chatFilesResource';
import { AttachmentChip } from './attachment-chip';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isStreaming: boolean;
    onStop: () => void;
    queued: string[];
    modelMenu?: ReactNode;
    placeholder?: string;
    attachments: IPendingAttachment[];
    onAttach: (files: File[]) => void;
    onRemoveAttachment: (localId: string) => void;
    canAttach: boolean;
    canSubmit: boolean;
}

export const MessageInput = ({
    value,
    onChange,
    onSubmit,
    isStreaming,
    onStop,
    queued,
    modelMenu,
    placeholder = 'Digite sua mensagem aqui...',
    attachments,
    onAttach,
    onRemoveAttachment,
    canAttach,
    canSubmit,
}: MessageInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const rejections = attachments.filter((attachment) => attachment.status === 'error');

    return (
        <form className={styles.messageInputForm}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            {attachments.length > 0 && (
                <div className={styles.attachmentTray}>
                    {attachments.map((attachment) => (
                        <AttachmentChip
                            key={attachment.localId}
                            filename={attachment.filename}
                            size={attachment.size}
                            status={attachment.status}
                            error={attachment.error}
                            onRemove={() => onRemoveAttachment(attachment.localId)}
                            isDisabled={isStreaming}
                        />
                    ))}
                </div>
            )}

            {queued.length > 0 && (
                <ul className={styles.queuedList} aria-label="Mensagens na fila">
                    {queued.map((message, index) => (
                        <li className={styles.queuedMessage} key={`${index}-${message}`}>
                            <span className={styles.queuedLabel}>Na fila:</span> {message}
                        </li>
                    ))}
                </ul>
            )}

            {rejections.map((rejection) => (
                <p className={styles.attachmentError} key={rejection.localId}>
                    {rejection.filename}: {rejection.error}
                </p>
            ))}

            <div className={styles.messageInputRow}>
                <button className={styles.attachButton}
                    type="button"
                    aria-label="Anexar arquivo"
                    title={canAttach ? 'Anexar arquivo' : 'Responda à pergunta acima antes de anexar'}
                    disabled={!canAttach}
                    onClick={() => fileInputRef.current?.click()}
                >
                    📎
                </button>
                {modelMenu}
                <input className={styles.hiddenFileInput}
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_FILE_TYPES}
                    aria-label="Arquivo para anexar"
                    onChange={(e) => {
                        onAttach(Array.from(e.target.files ?? []));
                        e.target.value = '';
                    }}
                />
                <input className={styles.messageInputField}
                    id="prompt-input"
                    name="prompt"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete="off"
                    placeholder={placeholder}
                />
                {isStreaming && (
                    <button className={styles.stopButton}
                        type="button"
                        aria-label="Parar resposta"
                        title="Parar resposta"
                        onClick={onStop}
                    >
                        <span className={styles.stopSquare} aria-hidden="true" />
                    </button>
                )}
                <button className={styles.messageSubmit}
                    type="submit"
                    disabled={!canSubmit}
                >
                    <span className={styles.submitArrow}>➤</span>
                    Enviar
                </button>
            </div>
        </form>
    );
};
