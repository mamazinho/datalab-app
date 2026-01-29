import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatContainer } from './chat-messages.style';
import { Messages } from '../../components/Messages/list-messages';

export const ChatMessages: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    console.error(error);
    setError('Error occurred, check the browser developer console for more information.');
  };

  return (
    <ChatContainer>
      <main className="h-100">
        <div className="text-center mb-3">
          <h2>Chat {chatId}</h2>
          <p className="text-muted">Converse com nossa IA e tire suas dúvidas</p>
        </div>

        <Messages chatId={Number(chatId)} onError={handleError} />

        {error && (
          <div className="text-danger mt-3">
            {error}
          </div>
        )}
      </main>
    </ChatContainer>
  );
};
