<script lang="ts">
	import { processStreamResponse } from '$lib/processors/stream-processor';
	import { onMount } from 'svelte';
    import type { PageData, RouteParams } from './$types';
	import type { IMessage } from './interfaces';

    let { data, params }: { data: PageData, params: RouteParams } = $props();

    let { loadInitialMessages } = data;
    let messages = $state<IMessage[]>([]);

    onMount(async () => {
        let historicalMessages = await loadInitialMessages();
        console.log("Loaded messages:", historicalMessages);
        processStreamResponse(
            historicalMessages,
            (historicalMessages: IMessage[]) => { messages.push(...historicalMessages) }
        );
    });


</script>


<h1>Chat ID: {params.chatId}</h1>

<h2>Messages ({messages.length}):</h2>
{#each messages as message }

    <div>{message.content}</div>
    <div>{message.role}</div>
    <div>{message.timestamp}</div>
    
{/each}

<form action="/sendMessage" method="post"></form>

<button onclick={() => messages.push({ content: "aaa", role: 'user', timestamp: new Date().toString() })}>Add Message</button>


<hr/>
