import styles from './modal.module.css';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<IModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay}>
            {/* Backdrop click handler */}
            <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
            <div className={styles.dialog} 
                role="dialog"
                aria-modal="true"
            >
                {title && (
                    <div className={styles.header}>
                        <h3 className={styles.title}>{title}</h3>
                        <button className={styles.closeButton} 
                            onClick={onClose}
                            aria-label="Fechar modal"
                        >
                            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
