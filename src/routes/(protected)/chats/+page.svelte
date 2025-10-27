<script lang="ts">
    import { DatalabAPI } from '$lib/apis/datalab-api';
</script>

<h1>Chats</h1>

<ul>
    {#await DatalabAPI.ChatsResource.getAllChats() }
        <p>Carregando</p>
    {:then chats }
        {#if chats.length === 0}
            <p>Nenhum chat disponível. Inicie uma conversa!</p>
        {:else}
            {#each chats as chat}
                <li><a href="/chats/{chat.id}/messages">{chat.title}</a></li>
            {/each}
        {/if}
    {:catch error }
        <p>Erro ao carregar chats: {error.message}</p>
    {/await}
</ul>