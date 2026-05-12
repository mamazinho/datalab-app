import React, { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { ActionItem, ActionsMenu, ActionsTrigger, StyledTable } from './table.style';

export const TableHeaders = ({ children, ...props }: ComponentPropsWithoutRef<'tr'>) => (
  <thead>
    <tr {...props}>
      {children}
      <th aria-hidden="true" />
    </tr>
  </thead>
);

export const TableRow = (props: ComponentPropsWithoutRef<'tr'>) => <tr {...props} />;

export const TableAction = ({ children, ...props }: ComponentPropsWithoutRef<'button'>) => (
  <ActionItem role="menuitem" {...props}>{children}</ActionItem>
);

export const TableActions = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(v => !v);
  };

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <>
      <ActionsTrigger ref={triggerRef} onClick={toggle} aria-label="Abrir menu de ações" aria-expanded={open} aria-haspopup="menu">
        &#8942;
      </ActionsTrigger>
      {open && pos && (
        <ActionsMenu ref={menuRef} role="menu" style={{ top: pos.top, right: pos.right }}>
          {children}
        </ActionsMenu>
      )}
    </>
  );
};

export const ActionTable = ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => {
  const all = React.Children.toArray(children);
  const thead = all.filter(c => React.isValidElement(c) && c.type === TableHeaders);
  const tbody = all.filter(c => !React.isValidElement(c) || c.type !== TableHeaders);

  return (
    <StyledTable {...props}>
      {thead}
      {tbody.length > 0 && <tbody>{tbody}</tbody>}
    </StyledTable>
  );
};
