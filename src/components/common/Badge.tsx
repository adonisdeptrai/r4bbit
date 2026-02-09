import React from 'react';
import { cn } from './utils';

export interface BadgeProps {
    children?: React.ReactNode;
    className?: string;
    key?: React.Key;
}

export const Badge = ({ children, className }: BadgeProps) => {
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-cream text-brand-cyan border border-brand-cyan/20 shadow-sm",
            className
        )}>
            {children}
        </span>
    );
};
