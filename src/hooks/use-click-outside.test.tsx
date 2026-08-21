import { createRef } from 'react';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useClickOutside } from './use-click-outside';

const mountElement = (): HTMLElement => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
};

const mouseDownOn = (target: Node) => {
  target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useClickOutside', () => {
  it('fires onOutside on a mousedown outside the element', () => {
    const ref = createRef<HTMLElement>();
    ref.current = mountElement();
    const onOutside = vi.fn();

    renderHook(() => useClickOutside(ref, onOutside));
    mouseDownOn(document.body);

    expect(onOutside).toHaveBeenCalledOnce();
  });

  it('ignores a mousedown inside the element', () => {
    const ref = createRef<HTMLElement>();
    const element = mountElement();
    const child = document.createElement('button');
    element.appendChild(child);
    ref.current = element;
    const onOutside = vi.fn();

    renderHook(() => useClickOutside(ref, onOutside));
    mouseDownOn(child);

    expect(onOutside).not.toHaveBeenCalled();
  });

  it('accepts multiple refs (trigger plus floating menu)', () => {
    const triggerRef = createRef<HTMLElement>();
    const menuRef = createRef<HTMLElement>();
    triggerRef.current = mountElement();
    menuRef.current = mountElement();
    const onOutside = vi.fn();

    renderHook(() => useClickOutside([triggerRef, menuRef], onOutside));

    mouseDownOn(menuRef.current);
    expect(onOutside).not.toHaveBeenCalled();

    mouseDownOn(document.body);
    expect(onOutside).toHaveBeenCalledOnce();
  });

  it('does not listen while enabled is false', () => {
    const ref = createRef<HTMLElement>();
    ref.current = mountElement();
    const onOutside = vi.fn();

    const { rerender } = renderHook(({ enabled }) => useClickOutside(ref, onOutside, enabled), {
      initialProps: { enabled: false },
    });

    mouseDownOn(document.body);
    expect(onOutside).not.toHaveBeenCalled();

    rerender({ enabled: true });
    mouseDownOn(document.body);
    expect(onOutside).toHaveBeenCalledOnce();
  });

  it('always uses the latest callback without re-subscribing the listener', () => {
    const ref = createRef<HTMLElement>();
    ref.current = mountElement();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(({ onOutside }) => useClickOutside(ref, onOutside), {
      initialProps: { onOutside: first },
    });

    rerender({ onOutside: second });
    mouseDownOn(document.body);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('removes the listener on unmount', () => {
    const ref = createRef<HTMLElement>();
    ref.current = mountElement();
    const onOutside = vi.fn();

    const { unmount } = renderHook(() => useClickOutside(ref, onOutside));
    unmount();
    mouseDownOn(document.body);

    expect(onOutside).not.toHaveBeenCalled();
  });
});
