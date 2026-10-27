import { useState, type ComponentPropsWithoutRef } from 'react';

type AvatarSeed = 'initial' | 'first-name';

interface IAvatarProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src'> {
  src?: string | null;
  name: string;
  seed?: AvatarSeed;
}

const initialsOf = (name: string, seed: AvatarSeed): string => {
  const firstName = [...name.trim().split(/\s+/)[0]].filter((char) => char !== '&' && char !== '<');
  return firstName.slice(0, seed === 'initial' ? 1 : 2).join('').toUpperCase() || 'U';
};

const buildInitialsUrl = (name: string, seed: AvatarSeed): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#FFBE00"/><text x="50%" y="50%" dy=".1em" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" font-size="28" font-weight="600" fill="#00001F">${initialsOf(name, seed)}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Google refuses profile photos requested with a referrer
export const Avatar = ({ src, name, seed = 'first-name', ...imgProps }: IAvatarProps) => {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  return (
    <img
      {...imgProps}
      src={src && src !== brokenSrc ? src : buildInitialsUrl(name, seed)}
      referrerPolicy="no-referrer"
      onError={() => setBrokenSrc(src ?? null)}
    />
  );
};
