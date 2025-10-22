<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let { chats } = data;

</script>

<h1>Chats</h1>

{#if chats.length === 0}
    <p>Nenhum chat disponível. Inicie uma conversa!</p>
{:else}
    <ul>
        {#each chats as chat}
            <li><a href="/chats/{chat.id}/messages">{chat.title}</a></li>
        {/each}
    </ul>
{/if}