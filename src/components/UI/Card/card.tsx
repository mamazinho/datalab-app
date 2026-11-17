import styles from './card.module.css';
import type { ReactNode } from 'react';

interface ICardProps {
  title: string;
  actions?: ReactNode;
  state?: 'ok' | 'warning' | 'error';
  children?: ReactNode;
}

export const Card = ({ title, actions, state, children }: ICardProps) => (
  <section className={styles.card} data-state={state} aria-label={title}>
    <div className={styles.cardHead}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {actions}
    </div>
    {children}
  </section>
);
