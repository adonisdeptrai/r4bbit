import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        const variants = {
            primary: 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/25 hover:bg-cyan-500 hover:shadow-cyan-500/40 border-transparent',
            secondary: 'bg-white text-brand-dark border-gray-200 hover:border-brand-cyan hover:text-brand-cyan shadow-sm',
            outline: 'bg-transparent border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10',
            ghost: 'bg-transparent text-brand-gray hover:text-brand-cyan hover:bg-brand-cyan/5 border-transparent',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-lg',
            md: 'px-5 py-2.5 text-base rounded-xl',
            lg: 'px-8 py-4 text-lg font-semibold rounded-2xl',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    'inline-flex items-center justify-center transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);
Button.displayName = 'Button';
