import styles from '../trackin-master.module.css';
import { Suspense, useEffect, useState } from 'react';
import { toastRequestError } from '../../../components/Feedback/ErrorToast';
import { LoadingPiece } from '../../../components/Feedback/Loadings/loading';
import { useChatMessages } from '../../../hooks/use-chat-messages';
import { DatalabAPI } from '../../../services/datalab-api';
import type { UUID7 } from '../../../types/ids';
import { ChatConversation } from '../../Chats/Messages/components/chat-conversation';
import { useChatAttachments } from '../../Chats/Messages/use-chat-attachments';

const Conversation = ({ chatId, opening }: { chatId: UUID7; opening: string }) => {
  const { data: history } = useChatMessages(chatId);
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState(opening);
  const attachments = useChatAttachments(chatId);

  return (
    <ChatConversation
      chatId={chatId}
      history={history}
      model={model}
      onModelChange={setModel}
      prompt={prompt}
      onPromptChange={setPrompt}
      attachments={attachments}
    />
  );
};

// The conversation lives as long as this panel: leaving it, closing or reloading the page deletes the chat.
// The delete is best effort; the chat list leaves these chats out anyway, so it never shows one.
export const AdvisorChat = ({ opening }: { opening: string }) => {
  const [chatId, setChatId] = useState<UUID7 | null>(null);

  useEffect(() => {
    let created: UUID7 | null = null;
    let left = false;
    const leave = () => {
      if (!created) return;
      const chat = created;
      created = null;
      DatalabAPI.ChatsResource.deleteChatOnLeave(chat).catch(() => {});
    };

    DatalabAPI.ChatsResource.createChat({
      title: `Trackin' Master · ${crypto.randomUUID().slice(0, 8)}`,
      is_private: true,
      supervisor: 'trackin_master',
    })
      .then((chat) => {
        created = chat.id;
        if (left) leave();
        else setChatId(chat.id);
      })
      .catch(toastRequestError);
    window.addEventListener('pagehide', leave);

    return () => {
      left = true;
      window.removeEventListener('pagehide', leave);
      leave();
    };
  }, []);

  return (
    <section className={styles.trackinAdvisor} aria-label="Conversa com o assessor">
      {chatId ? (
        <Suspense fallback={<LoadingPiece />}>
          <Conversation chatId={chatId} opening={opening} />
        </Suspense>
      ) : (
        <LoadingPiece />
      )}
    </section>
  );
};
