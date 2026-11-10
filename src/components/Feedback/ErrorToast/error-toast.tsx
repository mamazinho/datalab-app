import { useState } from 'react';
import styles from './error-toast.module.css';

interface IErrorToastProps {
  message: string;
  traceId?: string;
}

export const ErrorToast = ({ message, traceId }: IErrorToastProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!traceId) return <span>{message}</span>;

  return (
    <div
      className={styles.errorToast}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={(event) => {
        event.stopPropagation();
        setExpanded((current) => !current);
      }}
      onKeyDown={(event) => event.key === 'Enter' && setExpanded((current) => !current)}
    >
      <span>{message}</span>
      {expanded && (
        <small className={styles.trace}>
          Use este código ao falar com o suporte: <code className={styles.traceId}>{traceId}</code>
        </small>
      )}
    </div>
  );
};
