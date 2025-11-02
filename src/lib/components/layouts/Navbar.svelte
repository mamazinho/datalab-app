<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { auth } from '$lib/states/auth.svelte';
	import favicon from '$lib/assets/favicon.png';
    
    const menuPages = [
        { label: 'Home', href: '/' },
        { label: 'Chats', href: '/chats' }
    ]

    const logout = async () => {
        console.log('User logged out');
        await auth.logout();
        await goto('/login');
    }

</script>

<nav class="bg-white shadow dark:bg-gray-800 rounded-2xl">
    <div class="container flex items-center justify-between mx-auto">
        <a href="/"><img class="w-auto h-6 sm:h-7" src={favicon} alt="Logo da DataLab" /></a>
        <div class="container flex items-center justify-center p-6 mx-auto text-gray-600 capitalize dark:text-gray-300">
            {#each menuPages as { label, href }}
                {#if page.url.pathname === href}
                    <a {href} class="border-b-2 border-blue-500 text-gray-800 dark:text-gray-200 transition-colors duration-300 transform mx-1.5 sm:mx-6">{label}</a>
                {:else}
                    <a {href} class="border-b-2 border-transparent hover:text-gray-800 transition-colors duration-300 transform dark:hover:text-gray-200 hover:border-blue-500 mx-1.5 sm:mx-6">{label}</a>
                {/if}
            {/each}
        </div>
        <button 
            class="cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Logout"
            onclick={logout}
        >
            <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
            >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
        </button>
    </div>
</nav>