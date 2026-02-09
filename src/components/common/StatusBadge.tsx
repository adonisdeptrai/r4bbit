import React from 'react';
import { cn } from './utils';

type StatusVariant = 'light' | 'dark';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
}

// Light mode styles (for UserDashboard)
const lightStyles: Record<string, string> = {
    completed: 'bg-green-50 text-green-600 border-green-100',
    active: 'bg-green-50 text-green-600 border-green-100',
    Active: 'bg-green-50 text-green-600 border-green-100',
    processing: 'bg-blue-50 text-blue-600 border-blue-100',
    Pending: 'bg-blue-50 text-blue-600 border-blue-100',
    failed: 'bg-red-50 text-red-600 border-red-100',
    expired: 'bg-slate-100 text-slate-500 border-gray-200',
    Expired: 'bg-slate-100 text-slate-500 border-gray-200',
    refunded: 'bg-gray-50 text-gray-600 border-gray-100',
    'Update Available': 'bg-amber-50 text-amber-600 border-amber-100',
    'In Progress': 'bg-violet-50 text-violet-600 border-violet-100',
    Paid: 'bg-green-50 text-green-600 border-green-100',
};

// Dark mode styles (for AdminDashboard)
const darkStyles: Record<string, string> = {
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Pending Verification': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    expired: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Expired: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    matched: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    unmatched: 'bg-red-500/10 text-red-400 border-red-500/20',
    partial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const defaultStyles = {
    light: 'bg-blue-50 text-blue-600 border-blue-100',
    dark: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = 'dark',
    className
}) => {
    const styles = variant === 'light' ? lightStyles : darkStyles;
    const defaultStyle = defaultStyles[variant];
    const statusStyle = styles[status] || defaultStyle;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border tracking-wide",
            statusStyle,
            className
        )}>
            {status}
        </span>
    );
};

// Helper function for cases where only className is needed (backwards compat)
export const getStatusBadgeClass = (status: string, variant: StatusVariant = 'dark'): string => {
    const styles = variant === 'light' ? lightStyles : darkStyles;
    return styles[status] || defaultStyles[variant];
};
