import React, { useEffect, useState } from 'react';
import { useFinggu } from './provider';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const __ffClasses_Modal = [
    'ff-modal',
    'ff-modal-open',
    'ff-modal-closed',
    'ff-modal-overlay',
    'ff-modal-content'
];

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
    const { resolveAll } = useFinggu();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setMounted(false), 300); // Wait for exit animation
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted && !isOpen) return null;

    return (
        <div
            className={resolveAll(['ff-modal', isOpen ? 'ff-modal-open' : 'ff-modal-closed'])}
            aria-hidden={!isOpen}
        >
            <div className="ff-modal-overlay" onClick={onClose} />
            <div className={resolveAll(['ff-modal-content', className])}>
                {children}
            </div>
        </div>
    );
};
