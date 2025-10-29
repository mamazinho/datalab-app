<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { z } from 'zod';

	interface Props<T> {
        method?: HTMLFormAttributes["method"];
		schema: z.ZodObject<any>;
		data: T;
		onSubmit: (e: SubmitEvent) => void | Promise<void>;
		children?: Snippet;
	}

	let { method = "post", schema, data, onSubmit, children }: Props<T> = $props();

	let errors = $state();

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		const result = schema.safeParse(data);
        if (!result.success) {
			const fieldErrors = z.treeifyError(result.error).errors;
			errors = Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]]));
			return;
		};

		return await onSubmit(e);
	}
</script>

<div>
	<form {method} class="flex items-stretch gap-3 py-5" onsubmit={handleSubmit}>
		{@render children?.()}
	</form>

	{#if errors}
		<span class="error">{JSON.stringify(errors)}</span>
	{/if}
</div>

<style>
	.error {
		color: #c53030;
		font-size: 0.85rem;
		margin-top: 0.25rem;
		display: block;
	}
</style>