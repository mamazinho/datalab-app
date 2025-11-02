import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/states/auth.svelte';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
  const ok = await auth.ensureSession();
  if (ok) {
    if (url.pathname === '/') return;
    throw redirect(302, '/');
  }
  
  const isAuthenticated = auth.isAuthenticated;
  if (isAuthenticated) {
    if (url.pathname === '/') return;
    throw redirect(302, '/');
  }

  return {};
};