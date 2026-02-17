import React, { useState, useRef, useEffect } from 'react';
import { useFinggu } from './provider';

export interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: 'left' | 'right';
}

export const __ffClasses_Dropdown = [
    'ff-dropdown',
    'ff-dropdown-trigger',
    'ff-dropdown-menu',
    'ff-dropdown-menu-right',
    'ff-dropdown-item'
];

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'left' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolveAll } = useFinggu();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={resolveAll(['ff-dropdown'])} ref={containerRef}>
            <button
                type="button"
                className={resolveAll(['ff-dropdown-trigger'])}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {trigger}
            </button>
            <div
                className={resolveAll([
                    'ff-dropdown-menu',
                    align === 'right' && 'ff-dropdown-menu-right'
                ])}
                data-ff-state={isOpen ? 'open' : 'closed'}
                role="menu"
                aria-hidden={!isOpen}
            >
                {children}
            </div>
        </div>
    );
};

export const DropdownItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    const { resolveAll } = useFinggu();
    return <div className={resolveAll(['ff-dropdown-item', className])} {...props}>{children}</div>;
};
