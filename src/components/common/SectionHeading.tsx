import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';

export const SectionHeading = ({ title, subtitle, align = 'center' }: { title: string, subtitle?: string, align?: 'left' | 'center' }) => (
    <div className={cn("mb-12", align === 'center' ? 'text-center' : 'text-left')}>
        {subtitle && (
            <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-brand-cyan font-semibold tracking-wide uppercase text-sm mb-2 block"
            >
                {subtitle}
            </motion.span>
        )}
        <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight"
        >
            {title}
        </motion.h2>
        <div className={cn("mt-4 h-1.5 w-16 bg-brand-cyan rounded-full", align === 'center' ? 'mx-auto' : '')} />
    </div>
);
