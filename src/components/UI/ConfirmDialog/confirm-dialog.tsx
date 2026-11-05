import styles from './confirm-dialog.module.css';
import { Modal } from '../Modal/modal';

interface IConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({ isOpen, title, message, confirmLabel, onConfirm, onCancel }: IConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title}>
    <p className={styles.message}>{message}</p>
    <div className={styles.actions}>
      <button className={styles.cancelButton} type="button" onClick={onCancel} autoFocus>
        Cancelar
      </button>
      <button className={styles.confirmButton} type="button" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
