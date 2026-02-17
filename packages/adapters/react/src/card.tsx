import React from 'react';
import { useFinggu } from './provider';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'outline' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const VARIANTS = {
    outline: 'ff-card-outline',
    glass: 'ff-card-glass'
};

const PADDINGS = {
    none: 'ff-p-0',
    sm: 'ff-p-2',
    md: 'ff-p-4',
    lg: 'ff-p-8'
};

export const __ffClasses_Card = [
    'ff-card',
    'ff-card-header',
    'ff-card-body',
    ...Object.values(VARIANTS),
    ...Object.values(PADDINGS)
];

export const Card: React.FC<CardProps> = ({
    variant,
    padding = 'md',
    className,
    children,
    ...props
}) => {
    const { resolveAll } = useFinggu();

    const ffClasses = resolveAll([
        'ff-card',
        variant && VARIANTS[variant],
        PADDINGS[padding],
        className
    ]);

    return (
        <div className={ffClasses} {...props}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    const { resolveAll } = useFinggu();
    return <div className={resolveAll(['ff-card-header', className])} {...props}>{children}</div>;
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    const { resolveAll } = useFinggu();
    return <div className={resolveAll(['ff-card-body', className])} {...props}>{children}</div>;
};
