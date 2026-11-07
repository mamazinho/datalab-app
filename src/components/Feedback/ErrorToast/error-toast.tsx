import styles from './error-toast.module.css';

interface IErrorToastProps {
  message: string;
  traceId?: string;
}

export const ErrorToast = ({ message, traceId }: IErrorToastProps) => (
  <div className={styles.errorToast}>
    <span>{message}</span>
    {traceId && <small className={styles.traceId} title="Código para o suporte">{traceId}</small>}
  </div>
);
