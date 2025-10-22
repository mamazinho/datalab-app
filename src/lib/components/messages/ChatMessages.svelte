<script lang="ts">

	import type { IMessage } from '$lib/types/message';
	import MarkedRender from '../marked/MarkedRender.svelte';

    let { message, streaming = false }: { message: IMessage, streaming?: boolean } = $props();

    const isUser = $derived(message.role === 'user');
    const isAgent = $derived(message.role === 'agent');
    const formattedTimestamp = $derived(
        new Date(message.timestamp).toLocaleString('pt-BR')
    );

</script>

<div 
    class="message-container"
    class:user={isUser}
    class:agent={isAgent}
>
    <div 
        class="message-avatar"
        class:user={isUser}
        class:agent={isAgent}
    ></div>
    
    <div 
        class="message-bubble"
        class:user={isUser}
        class:agent={isAgent}
        class:streaming
    >
        <div 
            class="message-content"
            title={`${message.role} em ${formattedTimestamp}`}
        >
            <MarkedRender content={message.content} />
        </div>
        
        <div class="message-metadata">
            <span class="message-role">{message.role}</span>
            <span class="message-timestamp">{formattedTimestamp}</span>
        </div>
    </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  /* Container da mensagem */
  .message-container {
    display: flex;
    width: 100%;
    animation: fadeIn 0.3s ease-in;
  }

  .message-container.user {
    justify-content: flex-end;
  }

  .message-container.agent {
    justify-content: flex-start;
  }

  /* Bubble da mensagem */
  .message-bubble {
    max-width: 70%;
    padding: 0.875rem 1.125rem;
    border-radius: 18px;
    word-wrap: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  /* Mensagem do usuário */
  .message-bubble.user {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-top-right-radius: 4px;
  }

  .message-bubble.user::after {
    content: '';
    position: absolute;
    top: 0;
    right: -8px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 20px 10px 0 0;
    border-color: #764ba2 transparent transparent transparent;
  }

  /* Mensagem do agente */
  .message-bubble.agent {
    background: linear-gradient(135deg, #ffc966 0%, #ffd891 100%);
    /* background: #ffffff; */
    color: #1f2937;
    border: 1px solid #e5e7eb;
    border-top-left-radius: 4px;
  }

  .message-bubble.agent::after {
    content: '';
    position: absolute;
    top: 0;
    left: -8px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 20px 0 0 10px;
    border-color: #ffffff transparent transparent transparent;
  }

  .message-bubble.agent::before {
    content: '';
    position: absolute;
    top: 0;
    left: -9px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 20px 0 0 10px;
    border-color: #e5e7eb transparent transparent transparent;
  }

  /* Conteúdo da mensagem */
  .message-content {
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 0.375rem;
  }

  /* Metadados (role e timestamp) */
  .message-metadata {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 0.25rem;
  }

  .message-bubble.user .message-metadata {
    justify-content: flex-end;
    color: rgba(255, 255, 255, 0.9);
  }

  .message-bubble.agent .message-metadata {
    justify-content: flex-start;
    color: #6b7280;
  }

  .message-role {
    font-weight: 600;
    text-transform: capitalize;
  }

  .message-timestamp {
    font-style: italic;
  }

  /* Avatar/Ícone (opcional) */
  .message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.875rem;
    flex-shrink: 0;
    margin: 0 0.5rem;
  }

  .message-avatar.user {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    order: 1;
  }

  .message-avatar.agent {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
    order: -1;
  }

  /* Estado de digitação/streaming */
  .message-bubble.streaming {
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* Animações */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .message-bubble {
      max-width: 85%;
    }
  }

</style>