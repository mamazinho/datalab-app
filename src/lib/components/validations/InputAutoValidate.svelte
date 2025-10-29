<script lang="ts">
	import { z } from 'zod';

	interface Props {
		id: string;
		label: string;
		type?: string;
		value: string;
		schema: z.ZodTypeAny;
	}

	let {
		id,
		label,
		type = 'text',
		value = $bindable(''),
		schema
	}: Props = $props();

	let touched = $state(false);
	let errors = $state<string>("");

	function validate(value: string) {
		if (!touched) return;

		const result = schema.safeParse(value);
		if (result.success) return;

		errors = z.treeifyError(result.error).errors.join(', ') || "";
	}

	$effect(() => {
		validate(value);
	});

</script>

<div>
	<label for={id}>{label}</label>
	<input {id} {type} bind:value onblur={() => touched = true} />
	{#if errors}
		<span class="error">{errors}</span>
	{/if}
</div>

<style>
	label {
		font-size: 0.9rem;
	}
	input {
		padding: 0.5rem;
		font-size: 1rem;
		width: 100%;
	}
	.error {
		color: #c53030;
		font-size: 0.85rem;
		margin-top: 0.25rem;
		display: block;
	}
</style>
