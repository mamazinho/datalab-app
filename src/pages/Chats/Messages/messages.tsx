import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageContainer } from './messages.style';
import { Messages } from './components/list-messages';

export const ChatMessages: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    console.error(error);
    setError('Error occurred, check the browser developer console for more information.');
  };

  return (
    <MessageContainer>
      <main className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 my-4">
        <div className="mb-6 pb-4 border-b border-gray-100 text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Chat <span className="text-orange-600">#{chatId}</span></h2>
          <p className="text-gray-500 text-sm md:text-base">Converse com nossa IA e tire suas dúvidas</p>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
            <Messages chatId={Number(chatId)} onError={handleError} />
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 animate-pulse">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
      </main>
    </MessageContainer>
  );
};
