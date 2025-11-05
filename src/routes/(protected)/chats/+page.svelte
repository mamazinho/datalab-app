<script lang="ts">
	import { goto } from '$app/navigation';
    import { DatalabAPI } from '$lib/apis/datalab-api';

    const createChat = async () => {
        try {
            const newChat = await DatalabAPI.ChatsResource.createChat({ title: 'New Chat' });
            console.log('Chat criado com sucesso:', newChat);
            goto(/`/chats/${newChat.id}/messages`);
        } catch (error) {
            console.error('Erro ao criar chat:', error);
        }
    };
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


    <button onclick={createChat}>Iniciar novo chat</button>
</ul>