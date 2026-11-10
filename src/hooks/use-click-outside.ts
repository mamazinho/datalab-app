import { useEffect, useEffectEvent, type RefObject } from 'react';

type ClickOutsideRefs = RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>;

export function useClickOutside(refs: ClickOutsideRefs, onOutside: () => void, enabled = true): void {
  const handleMouseDown = useEffectEvent((event: MouseEvent) => {
    const target = event.target as Node;
    const isInside = [refs].flat().some((ref) => ref.current?.contains(target));
    if (!isInside) onOutside();
  });

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent) => handleMouseDown(event);
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [enabled]);
}
