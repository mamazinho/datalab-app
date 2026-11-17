import styles from './callout.module.css';
import type { ReactNode } from 'react';

interface ICalloutProps {
  title?: ReactNode;
  tone?: 'warning' | 'info';
  role?: 'note' | 'alert';
  label?: string;
  children?: ReactNode;
}

export const Callout = ({ title, tone = 'warning', role = 'note', label, children }: ICalloutProps) => (
  <div className={styles.callout} data-tone={tone} role={role} aria-label={label}>
    {title && <strong className={styles.calloutTitle}>{title}</strong>}
    {children}
  </div>
);
