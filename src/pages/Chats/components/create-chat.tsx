import designSystemStyles from '../../../styles/design-system.module.css';
import styles from './chats-components.module.css';
import { useState, useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createChatAction } from '../actions';
import { Modal } from '../../../components/UI/Modal/modal';
import { Toggle } from '../../../components/UI/Inputs/Toggle';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { chatListsQueryKey } from '../../../queries';

export const CreateChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [createChatState, createChatFormAction, isCreateChatPending] = useActionState(createChatAction, INITIAL_ACTION_STATE);

    useActionFeedback(createChatState, {
        onSuccess: (chat) => {
            if (!chat) return;
            void queryClient.invalidateQueries({ queryKey: chatListsQueryKey });
            setIsOpen(false);
            navigate(`/ia/conversas/${chat.id}/mensagens`);
        },
    });

    return (
        <>
            <button className={styles.createChatButton} onClick={() => setIsOpen(true)}>
                <svg className={styles.createChatIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Criar nova conversa
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Nova Conversa"
            >
                <form className={styles.createChatForm} action={createChatFormAction}>
                    <fieldset className={styles.createChatFieldset} disabled={isCreateChatPending}>
                        <div className={styles.createChatField}>
                            <label className={designSystemStyles.label} htmlFor="chatTitle">
                                Título da Conversa
                            </label>
                            <input className={designSystemStyles.input}
                                id="chatTitle"
                                type="text"
                                name="title"
                                autoComplete="off"
                                placeholder="Ex: Análise de Vendas 2024"
                                required
                                autoFocus
                            />
                        </div>

                        <Toggle name="is_private" label="Conversa privada" defaultChecked />

                        <div className={styles.createChatActions}>
                            <button className={styles.createChatSubmit} type="submit">
                                {isCreateChatPending ? "Criando..." : "Criar"}
                            </button>
                        </div>
                    </fieldset>
                </form>
            </Modal>
        </>
    );
}
