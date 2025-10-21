import { DATALAB_API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

type IChat = {
  id: number;
  user_id: number;
  title: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  created_at: string;
  updated_at: string;
};


export const load: PageServerLoad = async () => {
  const loadAllChats = async () => {
    const res = await fetch(`${DATALAB_API_URL}/chats`);
    if (!res.ok) {
      throw new Error('Failed to fetch chats');
    }

    return await res.json() as IChat[];
  }
	return {
		chats: await loadAllChats() as IChat[]
	};
};