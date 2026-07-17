import type { ComponentPropsWithoutRef } from 'react';

type AvatarSeed = 'initial' | 'first-name';

interface IAvatarProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src'> {
  src?: string | null;
  name: string;
  size?: number;
  seed?: AvatarSeed;
}

const buildFallbackUrl = (name: string, size: number, seed: AvatarSeed): string => {
  const trimmedName = name.trim();
  const seedValue = (seed === 'initial' ? trimmedName[0] : trimmedName.split(' ')[0]) || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seedValue)}&background=FFBE00&color=00001F&bold=true&format=png&size=${size}`;
};

/**
 * Imagem de avatar com fallback automático (ui-avatars) quando não há URL.
 * Estilizável via styled(Avatar) — repassa className e demais props de <img>.
 */
export const Avatar = ({ src, name, size = 128, seed = 'first-name', ...imgProps }: IAvatarProps) => (
  <img src={src || buildFallbackUrl(name, size, seed)} {...imgProps} />
);
