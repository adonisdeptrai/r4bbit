import React from 'react';
import { AnimatedBackground } from '../landing/AnimatedBackground';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    showBackground?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className = '',
    showBackground = true
}) => (
    <div className={`min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-[#020617] text-white selection:bg-brand-cyan/30 ${className}`}>
        {showBackground && <AnimatedBackground />}
        {children}
    </div>
);
