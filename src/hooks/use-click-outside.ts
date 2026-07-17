import { useEffect, useRef, type RefObject } from 'react';

type ClickOutsideRefs = RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>;

/**
 * Executa onOutside quando um mousedown acontece fora do(s) elemento(s) referenciado(s).
 * Aceita múltiplas refs para casos como trigger + menu flutuante.
 */
export function useClickOutside(refs: ClickOutsideRefs, onOutside: () => void, enabled = true): void {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const refList = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const isInside = refList.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutsideRef.current();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [enabled]);
}
