import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ChatContainer } from './chat-messages.style';
import { MessagesHistory } from '../../components/Chat-Messages/messages-history';
import { DatalabAPI, processStreamResponse, type IMessage } from '../../services/datalab-api';

export const ChatMessages: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  // Parse response text and update messages state
  const addMessages = (newMessages: IMessage[]) => {
    // Update messages using a Map to avoid duplicates based on timestamp
    setMessages(prevMessages => {
      const messageMap = new Map();
      console.log("bbbbb", prevMessages, newMessages);
      
      // Add existing messages
      prevMessages.forEach(msg => messageMap.set(msg.timestamp, msg));
      
      // Add new messages
      newMessages.forEach(msg => messageMap.set(msg.timestamp, msg));
      
      return Array.from(messageMap.values()).sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
  };

  const handleError = (error: unknown) => {
    console.error(error);
    setError('Error occurred, check the browser developer console for more information.');
    setIsLoading(false);
    setIsDisabled(false);
  };

  // Process streaming response using the API service
  const processResponse = useCallback(async (stream: ReadableStream<Uint8Array> | null) => {
    try {
      // await chatApiService.processStreamResponse(
      await processStreamResponse(
        stream,
        (messages) => {
          console.log("messagess", messages)
          addMessages(messages);
          setIsLoading(false);
        },
        () => {
          setIsDisabled(false);
        }
      );
    } catch (error) {
      handleError(error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const currentPrompt = prompt;
    setPrompt('');
    setIsDisabled(true);

    try {
      const stream = await DatalabAPI.sendMessage(Number(chatId), currentPrompt);
      await processResponse(stream);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <ChatContainer>
      <main className="h-100">
        <div className="text-center mb-3">
          <h2>Chat {chatId}</h2>
          <p className="text-muted">Converse com nossa IA e tire suas dúvidas</p>
        </div>

        <MessagesHistory chatId={Number(chatId)} messages={messages} onMessage={addMessages} />

        <div className="d-flex justify-content-center mb-3">
          <div className={`spinner ${isLoading ? 'active' : ''}`} />
          {isLoading && (
            <p className="text-muted ms-3 align-self-center">
              <em>IA está pensando...</em>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="d-flex gap-2 align-items-end">
            <div className="flex-grow-1">
              <input
                id="prompt-input"
                name="prompt"
                className="form-control"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isDisabled}
                placeholder="Digite sua mensagem aqui..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isDisabled && prompt.trim()) {
                    e.preventDefault();
                    const form = e.currentTarget.closest('form');
                    if (form) {
                      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                      form.dispatchEvent(submitEvent);
                    }
                  }
                }}
              />
            </div>
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={isDisabled || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-1"></i>
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-danger mt-3">
            {error}
          </div>
        )}
      </main>
    </ChatContainer>
  );
};
