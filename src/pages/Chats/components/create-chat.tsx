import { useState, useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createChatAction } from '../actions';
import { Modal } from '../../../components/UI/Modal/modal';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { chatsQuery } from '../../../queries';
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

export const CreateChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [createChatState, createChatFormAction, isCreateChatPending] = useActionState(createChatAction, INITIAL_ACTION_STATE);

    useActionFeedback(createChatState, {
        onSuccess: (chat) => {
            if (!chat) return;
            // A página de mensagens busca o chat pelo id (GET chats/{id}/), então
            // não precisamos atualizar a lista aqui — só marcá-la stale para
            // recarregar quando /ia/conversas montar de novo.
            void queryClient.invalidateQueries({ queryKey: chatsQuery.queryKey });
            setIsOpen(false);
            navigate(`/ia/conversas/${chat.id}/mensagens`);
        },
    });

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
