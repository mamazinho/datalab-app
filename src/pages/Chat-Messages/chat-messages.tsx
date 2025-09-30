import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { useParams } from 'react-router-dom';
import chatApiService, { type Message } from '../../services/datalab-api/messagesApi';
import { ChatContainer } from './chat-messages.style';

export const ChatMessages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Parse response text and update messages state
  const addMessages = (newMessages: Message[]) => {
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
      await chatApiService.processStreamResponse(
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
      const stream = await chatApiService.sendMessage(currentPrompt);
      await processResponse(stream);
    } catch (error) {
      handleError(error);
    }
  };

  // Load messages on page load
  useEffect(() => {
    const loadMessages = async () => {
      try {
        console.log("iddddddddddd", id);
        const stream = await chatApiService.getChatMessages(id ? id : '1');
        await processResponse(stream);
      } catch (error) {
        handleError(error);
      }
    };

    loadMessages();
  }, [processResponse, id]); // Added id dependency to reload when chat changes

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ChatContainer>
      <main className="h-100">
        <div className="text-center mb-3">
          <h2>Chat {id}</h2>
          <p className="text-muted">Converse com nossa IA e tire suas dúvidas</p>
        </div>
        
        <div id="conversation" ref={conversationRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>💬 Nenhuma mensagem ainda</h5>
              <p>Comece uma conversa digitando sua pergunta abaixo!</p>
            </div>
          ) : (
            messages.map((message) => (
              // <div>{message.role}</div>
              <div
                key={message.timestamp}
                className={`${message.role}`}
                title={`${message.role} em ${new Date(message.timestamp).toLocaleString('pt-BR')}`}
                dangerouslySetInnerHTML={{
                  __html: message.content ? marked.parse(message.content) : ''
                }}
              />
            ))
          )}
        </div>

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
