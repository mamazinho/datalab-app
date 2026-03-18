import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Backdrop, Body, CloseButton, CloseIcon, Dialog, Header, Overlay, Title } from './modal.style';

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
        <Overlay>
            {/* Backdrop click handler */}
            <Backdrop onClick={onClose} aria-hidden="true" />
            
            <Dialog 
                role="dialog"
                aria-modal="true"
            >
                {title && (
                    <Header>
                        <Title>{title}</Title>
                        <CloseButton 
                            onClick={onClose}
                            aria-label="Fechar modal"
                        >
                            <CloseIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </CloseIcon>
                        </CloseButton>
                    </Header>
                )}
                <Body>
                    {children}
                </Body>
            </Dialog>
        </Overlay>,
        document.body
    );
};
