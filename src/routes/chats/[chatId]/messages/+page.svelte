<script lang="ts">
	import { processStreamResponse } from '$lib/processors/stream-processor';
	import { onMount } from 'svelte';
    import type { PageData, RouteParams } from './$types';
	import type { IMessage } from '$lib/types/message';
	import ChatMessages from '$lib/components/messages/ChatMessages.svelte';

    let { data, params }: { data: PageData, params: RouteParams } = $props();

    let { loadInitialMessages } = data;
    let messages = $state<IMessage[]>([]);
    let messagesOnStreaming = $state<IMessage[]>([]);
    let mapMessagesByRole = new Map<string, IMessage>();

    onMount(async () => {
        let historicalMessages = await loadInitialMessages();
        console.log("Loaded messages:", historicalMessages);
        processStreamResponse(
            historicalMessages,
            (historicalMessages: IMessage[]) => { messages.push(...historicalMessages) }
        );
    });

    const streamingMessages = async (newMessages: IMessage[]) => {
        console.log("streamingMessage", newMessages);

        const lastRole = newMessages[newMessages.length - 1]?.role;
        mapMessagesByRole.set(lastRole, newMessages[newMessages.length - 1]);

        console.log("mapMessagesByRole", Array.from(mapMessagesByRole.values()));
        const allNewMessages = Array.from(mapMessagesByRole.values());
        console.log("allNewMessages", allNewMessages);
        messagesOnStreaming.push(...allNewMessages);
    }

    const streamingCompleted = async () => {
        console.log("streamingCompleted");
        messages.push(...messagesOnStreaming);
        messagesOnStreaming = [];
        mapMessagesByRole.clear();
    }

    const handleMessageSubmit = async (event: Event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const userInput = String(formData.get('userInput')).trim();

        try {
            const response = await fetch('', {
                method: 'POST',
                body: JSON.stringify({ prompt: userInput }),
                headers: { 'Content-Type': 'application/json' },
            })
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            await processStreamResponse(
                response.body,
                streamingMessages,
                streamingCompleted
            );
        } catch (e) {
            console.error('There was a problem with the fetch operation:', e);
        }
    };


</script>


<h1>Chat ID: {params.chatId}</h1>

<h2>Messages ({messages.length}):</h2>

<div class="conversation">
    {#if messages.length === 0}
        <h5>💬 Nenhuma mensagem ainda</h5>
        <p>Comece uma conversa digitando sua pergunta abaixo!</p>
    {:else}
        {#each messages as message }
            <ChatMessages message={message} />
        {/each}
    {/if}

    {#if messagesOnStreaming.length > 0}
        {#each messagesOnStreaming as messageOnStreaming }
            <ChatMessages message={messageOnStreaming} />
        {/each}
    {/if}

</div>

<hr/>

<form method="post" onsubmit={handleMessageSubmit}>
    <label for="userInput">
        <input type="text" name="userInput" placeholder="Digite sua mensagem" required minlength="4" />
    </label>
    <button type="submit">Enviar</button>
</form>

<hr/>

<style lang="postcss">
  @reference "tailwindcss";

  .conversation {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
    max-height: 600px;
    overflow-y: auto;
    background: linear-gradient(to bottom, #f9fafb, #ffffff);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .conversation::-webkit-scrollbar {
    width: 8px;
  }

  .conversation::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .conversation::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  .conversation::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Mensagem vazia */
  .conversation h5 {
    text-align: center;
    color: #6b7280;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .conversation p {
    text-align: center;
    color: #9ca3af;
    font-size: 0.95rem;
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .conversation {
      padding: 1rem;
    }
  }

</style>
