import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './utils';

export interface CardProps extends HTMLMotionProps<'div'> {
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card = ({ className, children, ...props }: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
                "bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-brand-dark/5 overflow-hidden hover:shadow-2xl hover:shadow-brand-cyan/10 transition-shadow duration-500",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
