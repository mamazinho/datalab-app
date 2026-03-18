import { useState, useActionState, useEffect, useCallback } from 'react';
import { type IRetrieveChat } from '../../../services/datalab-api/chatsResource';
import { createChatAction } from '../actions';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { INITIAL_ACTION_STATE, type ActionState } from '../../../types/actions';
import {
    CreateChatActions,
    CreateChatButton,
    CreateChatField,
    CreateChatFieldset,
    CreateChatForm,
    CreateChatIcon,
    CreateChatInput,
    CreateChatLabel,
    CreateChatSubmit,
} from './chats-components.style';

interface ICreateChatProps {
    onCreateChat: (chat: IRetrieveChat) => void;
}

export const CreateChat = ({ onCreateChat }: ICreateChatProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [createChatState, createChatFormAction, isCreateChatPending] = useActionState(createChatAction, INITIAL_ACTION_STATE);

    const handleCreateChatResult = useCallback((formState: ActionState<IRetrieveChat>) => {
        if (formState.timestamp === 0) return;
        if (formState.success && formState.data) {
            onCreateChat(formState.data);
            setIsOpen(false);
        } else if (formState.error) {
            toast.error(formState.error);
        }
    }, [onCreateChat]);

    useEffect(() => {
        handleCreateChatResult(createChatState);
    }, [createChatState, handleCreateChatResult]);

    return (
        <>
            <CreateChatButton onClick={() => setIsOpen(true)}>
                <CreateChatIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </CreateChatIcon>
                Criar nova conversa
            </CreateChatButton>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Nova Conversa"
            >
                <CreateChatForm action={createChatFormAction}>
                    <CreateChatFieldset disabled={isCreateChatPending}>
                        <CreateChatField>
                            <CreateChatLabel htmlFor="chatTitle">
                                Título da Conversa
                            </CreateChatLabel>
                            <CreateChatInput
                                id="chatTitle"
                                type="text"
                                name="title"
                                autoComplete="off"
                                placeholder="Ex: Análise de Vendas 2024"
                                required
                                autoFocus
                            />
                        </CreateChatField>

                        <CreateChatActions>
                            <CreateChatSubmit type="submit">
                                {isCreateChatPending ? "Criando..." : "Criar"}
                            </CreateChatSubmit>
                        </CreateChatActions>
                    </CreateChatFieldset>
                </CreateChatForm>
            </Modal>
        </>
    );
}