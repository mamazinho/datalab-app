import { auth } from '$lib/states/auth.svelte';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad, LayoutLoadEvent } from './$types';

export const ssr = false;

export const load: LayoutLoad = async ({ url }: LayoutLoadEvent) => {
  const ok = await auth.ensureSession();
  if (!ok) {
    if (url.pathname === '/login') return;
    throw redirect(302, '/login');
  }
  
  const isAuthenticated = auth.isAuthenticated;
  if (!isAuthenticated) {
    if (url.pathname === '/login') return;
    throw redirect(302, '/login');
  }

  return { 
    isAuthenticated: isAuthenticated,
    user: auth.currentUser
  };
};