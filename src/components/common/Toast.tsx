import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { cn } from './utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    count: number;
    timestamp: number; // Used to reset timer
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, count, timestamp, onClose }) => {
    // Determine dynamic duration based on text length? Or static.
    const DURATION = 3000;
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Reset progress when timestamp updates (which happens on duplicate toast)
        setProgress(100);

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                onClose();
            }
        }, 16); // 60fps

        return () => clearInterval(interval);
    }, [timestamp, onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-emerald-400" />,
        error: <AlertCircle size={20} className="text-red-400" />,
        info: <Info size={20} className="text-brand-cyan" />
    };

    const styles = {
        success: "bg-emerald-500/10 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
        error: "bg-red-500/10 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]",
        info: "bg-brand-cyan/10 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]"
    };

    const progressColors = {
        success: "bg-emerald-500",
        error: "bg-red-500",
        info: "bg-brand-cyan"
    };

    // Parse message to handle "Added [Product] to cart" -> "Added [Product] xN to cart"
    // Heuristic: If message ends with "to cart" and starts with "Added", insert xN.
    // Or just append xN to the message if it doesn't match specific pattern.
    // However, user requested: "Added Hidemyacc Auto-Reg xN to cart"
    // Input msg: "Added Hidemyacc Auto-Reg to cart"
    let displayMessage = message;
    if (count > 1) {
        if (message.startsWith("Added ") && message.endsWith(" to cart")) {
            // Split by " to cart"
            const core = message.substring(0, message.length - 8); // remove " to cart"
            displayMessage = `${core} x${count} to cart`;
        } else {
            displayMessage = `${message} (x${count})`;
        }
    }

    return (
        <motion.div
            layout // Enable layout animation for stacking
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto relative" // Removed overflow-hidden to allow shadow
        >
            <div className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-full backdrop-blur-xl relative overflow-hidden", // Added relative overflow-hidden
                "text-white font-medium min-w-[300px] max-w-[400px]",
                styles[type]
            )}>
                <div className="shrink-0">
                    {icons[type]}
                </div>
                <p className="flex-1 text-sm leading-tight">
                    {displayMessage}
                </p>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors opacity-60 hover:opacity-100"
                >
                    <X size={16} />
                </button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/5">
                    <motion.div
                        className={cn("h-full", progressColors[type])}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </motion.div>
    );
};
