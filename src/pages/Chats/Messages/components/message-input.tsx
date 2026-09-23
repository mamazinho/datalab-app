import { useRef } from 'react';
import type { IPendingAttachment } from '../../../../hooks/use-chat-attachments';
import { ACCEPTED_FILE_TYPES } from '../../../../services/datalab-api/chatFilesResource';
import { PendingAttachmentChips } from './attachment-chips';
import {
    AttachButton,
    AttachmentError,
    AttachmentTray,
    HiddenFileInput,
    MessageInputField,
    MessageInputForm,
    MessageInputRow,
    MessageSubmit,
    SubmitArrow,
    SubmitSpinner,
} from '../messages.style';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isDisabled: boolean;
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
    isLoading,
    isDisabled,
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
        <MessageInputForm
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            {attachments.length > 0 && (
                <AttachmentTray>
                    <PendingAttachmentChips
                        attachments={attachments}
                        onRemove={onRemoveAttachment}
                        isDisabled={isDisabled}
                    />
                </AttachmentTray>
            )}

            {rejections.map((rejection) => (
                <AttachmentError key={rejection.localId}>
                    {rejection.filename}: {rejection.error}
                </AttachmentError>
            ))}

            <MessageInputRow>
                <AttachButton
                    type="button"
                    aria-label="Anexar arquivo"
                    title={canAttach ? 'Anexar arquivo' : 'Responda à pergunta acima antes de anexar'}
                    disabled={isDisabled || !canAttach}
                    onClick={() => fileInputRef.current?.click()}
                >
                    📎
                </AttachButton>
                <HiddenFileInput
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
                <MessageInputField
                    id="prompt-input"
                    name="prompt"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isDisabled}
                    autoComplete="off"
                    placeholder={placeholder}
                />
                <MessageSubmit
                    type="submit"
                    disabled={isDisabled || !canSubmit}
                >
                    {isLoading ? (
                        <>
                            <SubmitSpinner role="status" aria-hidden="true" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <SubmitArrow>➤</SubmitArrow>
                            Enviar
                        </>
                    )}
                </MessageSubmit>
            </MessageInputRow>
        </MessageInputForm>
    );
};
