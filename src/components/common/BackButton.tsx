import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
    showLabel?: boolean;
    className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
    onClick,
    label = 'Back to Home',
    showLabel = true,
    className = ''
}) => (
    <motion.button
        onClick={onClick}
        whileHover={{ x: -3 }}
        className={`absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-all backdrop-blur-sm z-20 ${className}`}
    >
        <ArrowLeft size={16} />
        {showLabel && <span className="hidden sm:inline">{label}</span>}
    </motion.button>
);
