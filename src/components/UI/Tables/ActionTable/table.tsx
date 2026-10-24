import styles from './table.module.css';
import React, { useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { useClickOutside } from '../../../../hooks/use-click-outside';

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
  <button className={styles.actionItem} role="menuitem" {...props}>{children}</button>
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

  useClickOutside([triggerRef, menuRef], () => setOpen(false), open);

  return (
    <>
      <button className={styles.actionsTrigger} ref={triggerRef} onClick={toggle} aria-label="Abrir menu de ações" aria-expanded={open} aria-haspopup="menu">
        &#8942;
      </button>
      {open && pos && (
        <div className={styles.actionsMenu} ref={menuRef} role="menu" style={{ top: pos.top, right: pos.right }}>
          {children}
        </div>
      )}
    </>
  );
};

export const ActionTable = ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => {
  const all = React.Children.toArray(children);
  const thead = all.filter(c => React.isValidElement(c) && c.type === TableHeaders);
  const tbody = all.filter(c => !React.isValidElement(c) || c.type !== TableHeaders);

  return (
    <table className={styles.styledTable} {...props}>
      {thead}
      {tbody.length > 0 && <tbody>{tbody}</tbody>}
    </table>
  );
};
