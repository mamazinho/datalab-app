<script lang="ts">
	import '$home/app.css';
	import favicon from '$lib/assets/favicon.png';
	import Footer from '$lib/components/layouts/Footer.svelte';
	
	let { children } = $props();

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="text-white p-4">
	<p>Área pública</p>
</header>

<main>
	{@render children?.()}
</main>

<footer>
	<Footer />
</footer>

<style lang="postcss">
  @reference "tailwindcss";

  header {
	background-color: #ffc966; 
  }
  
</style>

