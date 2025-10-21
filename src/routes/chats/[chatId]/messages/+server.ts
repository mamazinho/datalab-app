import { DATALAB_API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { RouteParams, RequestHandler } from '../$types';

export const GET: RequestHandler = async ({ params }: { params: RouteParams }) => {
	const API_URL = DATALAB_API_URL;
	console.log('BFF: Conectando à API externa para streaming...');

	if (!params.chatId) {
		throw error(400, 'BFF: Parâmetro chatId ausente.');
	}
	if (!API_URL) {
		throw error(500, 'BFF: A URL da API externa não está configurada.');
	}

	const path = `${API_URL}/chats/${params.chatId}/messages/`;
	try {
		const externalResponse = await fetch(path, {});

		if (!externalResponse.ok) {
			throw error(externalResponse.status, 'BFF: A API externa falhou.');
		}

		if (!externalResponse.body) {
			throw error(externalResponse.status, 'BFF: O corpo da resposta está vazio.');
		}

		return externalResponse;
		// return new Response(stream);
	} catch (e) {
		console.error('BFF: Erro crítico', e);
		throw error(500, 'BFF: Não foi possível estabelecer a conexão de streaming.');
	}
}
