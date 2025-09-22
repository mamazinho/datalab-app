import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import chatApiService, { type Message } from './services/chatApi';

const App: React.FC = () => {
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
        const stream = await chatApiService.getMessages();
        await processResponse(stream);
      } catch (error) {
        handleError(error);
      }
    };

    loadMessages();
  }, [processResponse]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationRef.current) {
      window.scrollTo({ 
        top: document.body.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages]);

  return (
    <main className="border rounded mx-auto my-5 p-4" style={{ maxWidth: '700px' }}>
      <h1>Chat App</h1>
      <p>Ask me anything...</p>
      
      <div id="conversation" className="px-2" ref={conversationRef}>
        {messages.map((message) => (
          <div
            key={message.timestamp}
            className={`border-top pt-2 ${message.role}`}
            title={`${message.role} at ${message.timestamp}`}
            dangerouslySetInnerHTML={{
              __html: message.content ? marked.parse(message.content) : ''
            }}
          />
        ))}
      </div>

      <div className="d-flex justify-content-center mb-3">
        <div className={`spinner ${isLoading ? 'active' : ''}`} />
      </div>

      <form onSubmit={handleSubmit}>
        <input
          id="prompt-input"
          name="prompt"
          className="form-control"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isDisabled}
          placeholder="Type your message..."
        />
        <div className="d-flex justify-content-end">
          <button 
            className="btn btn-primary mt-2" 
            type="submit"
            disabled={isDisabled || !prompt.trim()}
          >
            Send
          </button>
        </div>
      </form>

      {error && (
        <div className="text-danger mt-3">
          {error}
        </div>
      )}
    </main>
  );
};

export default App;