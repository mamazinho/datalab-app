<script lang="ts">

    import { page } from '$app/state';

    const menuPages = [
        { label: 'Home', href: '/' },
        { label: 'Chats', href: '/chats' }
    ]

</script>

<nav class="bg-white shadow dark:bg-gray-800 rounded-2xl">
    <div class="container flex items-center justify-between mx-auto">
        <a href="/"><img class="w-auto h-6 sm:h-7" src="favicon.ico" alt="Logo da DataLab" /></a>
        <div class="container flex items-center justify-center p-6 mx-auto text-gray-600 capitalize dark:text-gray-300">
            {#each menuPages as { label, href }}
                {#if page.url.pathname === href}
                    <a {href} class="border-b-2 border-blue-500 text-gray-800 dark:text-gray-200 transition-colors duration-300 transform mx-1.5 sm:mx-6">{label}</a>
                {:else}
                    <a {href} class="border-b-2 border-transparent hover:text-gray-800 transition-colors duration-300 transform dark:hover:text-gray-200 hover:border-blue-500 mx-1.5 sm:mx-6">{label}</a>
                {/if}
            {/each}
        </div>
    </div>
</nav>