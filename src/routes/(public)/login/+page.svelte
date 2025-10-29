<script lang="ts">
	import { DatalabAPI } from '$home/lib/apis/datalab-api';
	import type { ILoginUserRequest } from '$home/lib/types/auth';
	import FormAutoValidate from '$lib/components/validations/FormAutoValidate.svelte';
	import InputAutoValidate from '$lib/components/validations/InputAutoValidate.svelte';
	import { z } from 'zod';

	const LoginFormSchema = z.object({
		email: z.email( {message: 'Endereço de e-mail inválido'} ),
		password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres')
	});

	type LoginUserRequest = z.infer<typeof LoginFormSchema>;

	let userLoginForm = $state<LoginUserRequest>({
		email: '',
		password: ''
	});

	const handleLoginSubmit = async (event: Event) => {
		event.preventDefault();

		const loginData = userLoginForm as ILoginUserRequest;

		try {
			const response = await DatalabAPI.AuthResource.login(loginData);
			console.log('Login bem-sucedido:', response);
		} catch (error) {
			console.error('Erro ao fazer login:', error);
		}
	};
</script>

<h1>Login</h1>

<div class="mx-auto max-w-4xl px-4 sm:px-6">
	<FormAutoValidate
		schema={LoginFormSchema}
		data={userLoginForm}
		onSubmit={handleLoginSubmit}
	>
		<InputAutoValidate
			id="email"
			label="Email:"
			type="email"
			bind:value={userLoginForm.email}
			schema={LoginFormSchema.shape.email}
		/>

		<InputAutoValidate
			id="password"
			label="Password:"
			type="password"
			bind:value={userLoginForm.password}
			schema={LoginFormSchema.shape.password}
		/>

		<button 
			class="
				h-10 px-4 rounded
				cursor-pointer 
				bg-orange-500 text-white 
				flex items-center justify-center
				flex-shrink-0
				hover:bg-orange-600
				transition-colors
				mt-6
			" 
			type="submit"
		>
			Login
		</button>
	</FormAutoValidate>
</div>
<div>

	Ainda não possui uma conta?
</div>