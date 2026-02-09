import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './utils';

type GlassPanelVariant = 'default' | 'elevated' | 'subtle';

interface GlassPanelProps extends Omit<HTMLMotionProps<"div">, 'children'> {
    children: React.ReactNode;
    className?: string;
    variant?: GlassPanelVariant;
    rounded?: 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    padding?: string;
    as?: 'div' | 'section' | 'article';
    disableMotion?: boolean;
}

const variantStyles: Record<GlassPanelVariant, string> = {
    default: 'bg-white/5 backdrop-blur-xl border border-white/10',
    elevated: 'bg-[#0b1121]/90 backdrop-blur-xl border border-white/10 shadow-2xl',
    subtle: 'bg-white/5 backdrop-blur-sm border border-white/5',
};

const roundedStyles: Record<string, string> = {
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    'full': 'rounded-full',
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
    children,
    className,
    variant = 'default',
    rounded = '2xl',
    padding,
    as = 'div',
    disableMotion = false,
    ...props
}) => {
    const baseStyles = cn(
        variantStyles[variant],
        roundedStyles[rounded],
        padding,
        className
    );

    if (disableMotion) {
        const Component = as;
        return (
            <Component className={baseStyles}>
                {children}
            </Component>
        );
    }

    return (
        <motion.div
            className={baseStyles}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Static version without motion for simple use cases
export const GlassPanelStatic: React.FC<{
    children: React.ReactNode;
    className?: string;
    variant?: GlassPanelVariant;
    rounded?: 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}> = ({ children, className, variant = 'default', rounded = '2xl' }) => (
    <div className={cn(variantStyles[variant], roundedStyles[rounded], className)}>
        {children}
    </div>
);
