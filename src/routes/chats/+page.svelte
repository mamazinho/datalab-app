<script lang="ts">
    type Chat = {
        id: number;
        title: string;
    };
    let chats = $state<Chat[]>([{id: 1, title: "Chat de Exemplo"}]);
</script>

<h1>Chats</h1>

{#if chats.length === 0}
    <p>Nenhum chat disponível. Inicie uma conversa!</p>
{:else}
    <ul>
        {#each chats as chat}
            <li><a href="/chats/{chat.id}">{chat.title}</a></li>
        {/each}
    </ul>
{/if}