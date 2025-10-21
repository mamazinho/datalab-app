<script lang="ts">
	import { processStreamResponse } from '$lib/processors/stream-processor';
	import { onMount } from 'svelte';
    import type { PageData, RouteParams } from './$types';
	import type { IMessage } from './interfaces';

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
            <div>{message.content}</div>
            <div>{message.role}</div>
            <div>{message.timestamp}</div>
        {/each}
    {/if}

    {#if messagesOnStreaming.length > 0}
        {#each messagesOnStreaming as messageOnStreaming }
            <div>{messageOnStreaming.content}</div>
            <div>{messageOnStreaming.role}</div>
            <div>{messageOnStreaming.timestamp}</div>
        {/each}
    {/if}

</div>

<hr/>

<form method="post" action="?/sendMessage" onsubmit={handleMessageSubmit}>
    <label for="userInput">
        <input type="text" name="userInput" placeholder="Digite sua mensagem" required minlength="4" />
    </label>
    <button type="submit">Enviar</button>
</form>

<button onclick={() => messages.push({ content: "aaa", role: 'user', timestamp: new Date().toString() })}>Add Message</button>

<hr/>
