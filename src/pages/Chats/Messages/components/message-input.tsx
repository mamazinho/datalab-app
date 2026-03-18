import { MessageInputField, MessageInputForm, MessageInputRow, MessageSubmit, SubmitArrow, SubmitSpinner } from '../messages.style';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isDisabled: boolean;
}

export const MessageInput = ({ value, onChange, onSubmit, isLoading, isDisabled }: MessageInputProps) => {
    return (
        <MessageInputForm 
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <MessageInputRow>
                    <MessageInputField
                        id="prompt-input"
                        name="prompt"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={isDisabled}
                        autoComplete="off"
                        placeholder="Digite sua mensagem aqui..."
                        required
                    />
                <MessageSubmit
                    type="submit"
                        disabled={isDisabled || !value.trim()}
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
}
