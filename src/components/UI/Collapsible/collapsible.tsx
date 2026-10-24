import styles from './collapsible.module.css';
import { useId, useState, type ReactNode } from 'react';

interface ICollapsibleProps {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export const Collapsible = ({ label, defaultOpen = false, children }: ICollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={styles.collapsibleWrapper}>
      <button className={styles.collapsibleTrigger}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <svg className={styles.collapsibleChevron}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={styles.collapsibleContent} id={contentId} hidden={!isOpen} onInvalidCapture={() => setIsOpen(true)}>
        {children}
      </div>
    </div>
  );
};
