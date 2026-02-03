import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './utils';

interface LiquidCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    glowColor?: string; // Hex or tailwind class for the internal glow
}

export const LiquidCard: React.FC<LiquidCardProps> = ({
    children,
    className,
    glowColor = "from-brand-cyan/20",
    ...props
}) => {
    return (
        <motion.div
            className={cn(
                "group relative backdrop-blur-3xl bg-[#0F1420]/60 rounded-3xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10 hover:shadow-2xl hover:shadow-brand-cyan/10",
                className
            )}
            {...props}
        >
            {/* 1. Internal Gradient Glow */}
            <div className={cn(
                "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br",
                glowColor
            )} />

            {/* 2. Glass Shine Reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* 3. Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};
