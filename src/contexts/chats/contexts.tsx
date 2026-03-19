import { createContext, useContext } from 'react';
import type { IRetrieveChat } from '../../services/datalab-api/chatsResource';

interface IChatsContextProps {
  chats: IRetrieveChat[];
  isLoadingChats: boolean;
  getAllChats: () => Promise<IRetrieveChat[]>;
}

export const ChatsContext = createContext({} as IChatsContextProps);

export const useChatsContext = () => {
  const context = useContext(ChatsContext);

  if (!context) {
    throw new Error('useChatsContext must be used within a ChatsProvider');
  }

  return context;
};
