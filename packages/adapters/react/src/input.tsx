import React from 'react';
import { useFinggu } from './provider';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const __ffClasses_Input = [
    'ff-input',
    'ff-input-error'
];

export const Input: React.FC<InputProps> = ({ error, className, ...props }) => {
    const { resolveAll } = useFinggu();

    const ffClasses = resolveAll([
        'ff-input',
        error && 'ff-input-error',
        className
    ]);

    return <input className={ffClasses} {...props} />;
};
