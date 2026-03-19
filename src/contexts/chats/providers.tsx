import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { DatalabAPI } from '../../services/datalab-api';
import type { IRetrieveChat } from '../../services/datalab-api/chatsResource';
import { ChatsContext } from './contexts';

export const ChatsProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<IRetrieveChat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const getAllChats = useCallback(async (): Promise<IRetrieveChat[]> => {
    setIsLoadingChats(true);

    try {
      const data = await DatalabAPI.ChatsResource.getAllChats();
      setChats(data);
      return data;
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({ chats, isLoadingChats, getAllChats }),
    [chats, isLoadingChats, getAllChats],
  );

  return (
    <ChatsContext.Provider value={contextValue}>
      {children}
    </ChatsContext.Provider>
  );
};
