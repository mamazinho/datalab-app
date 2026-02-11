import { useState, useActionState, useEffect, useCallback } from 'react';
import { type IRetrieveChat } from '../../../services/datalab-api/chatsResource';
import { createChatAction } from '../actions';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { INITIAL_ACTION_STATE, type ActionState } from '../../../types/actions';

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
            <button
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium cursor-pointer flex items-center gap-2 active:scale-95"
                onClick={() => setIsOpen(true)}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Criar novo chat
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Novo Chat"
            >
                <form action={createChatFormAction}>
                    <fieldset disabled={isCreateChatPending} className="flex flex-col gap-4">
                        <div className="space-y-1">
                            <label htmlFor="chatTitle" className="block text-sm font-semibold text-gray-700 ml-1">
                                Título do Chat
                            </label>
                            <input
                                id="chatTitle"
                                type="text"
                                name="title"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                autoComplete="off"
                                placeholder="Ex: Análise de Vendas 2024"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="submit"
                                className="bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-all font-bold shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-wait min-w-25"
                            >
                                {isCreateChatPending ? "Criando..." : "Criar"}
                            </button>
                        </div>
                    </fieldset>
                </form>
            </Modal>
        </>
    );
}