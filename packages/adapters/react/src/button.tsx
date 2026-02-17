import React from 'react';
import { useFinggu } from './provider';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    motion?: 'fade' | 'slide-up' | 'scale-in' | 'lift';
    glass?: boolean;
}

const VARIANTS = {
    primary: 'ff-btn-primary',
    secondary: 'ff-btn-secondary',
    ghost: 'ff-btn-ghost',
    outline: 'ff-btn-outline'
};

const SIZES = {
    sm: 'ff-btn-sm',
    md: 'ff-btn-md',
    lg: 'ff-btn-lg'
};

const MOTIONS = {
    fade: 'ff-fade-in',
    'slide-up': 'ff-slide-up',
    'scale-in': 'ff-scale-in',
    lift: 'ff-hover-lift'
};

/**
 * Static manifest of all classes used by Button.
 * Used by compiler for deterministic tree-shaking regardless of build order.
 */
export const __ffClasses_Button = [
    'ff-btn',
    ...Object.values(VARIANTS),
    ...Object.values(SIZES),
    ...Object.values(MOTIONS),
    'ff-card-glass'
];

/**
 * Finggu Button Component
 * Maps props to deterministic ff-* classes or hashed equivalents.
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    motion,
    glass,
    className,
    children,
    ...props
}) => {
    const { resolveAll } = useFinggu();

    const ffClasses = resolveAll([
        'ff-btn',
        VARIANTS[variant],
        SIZES[size],
        glass && 'ff-card-glass',
        motion && MOTIONS[motion],
        className
    ]);

    return (
        <button className={ffClasses} {...props}>
            {children}
        </button>
    );
};
