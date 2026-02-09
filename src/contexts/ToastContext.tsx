import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast, ToastType } from '../components/common/Toast';

export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    count: number;
    timestamp: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((msg: string, toastType: ToastType = 'info') => {
        setToasts((prev) => {
            // Check for duplicate message 
            const existingIndex = prev.findIndex(t => t.message === msg && t.type === toastType);

            if (existingIndex !== -1) {
                // Update existing toast count and reset timer (by creating new object with new timestamp)
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    count: updated[existingIndex].count + 1,
                    timestamp: Date.now() // Reset timer
                };
                return updated;
            }

            // Add new toast
            const newItem: ToastItem = {
                id: Math.random().toString(36).substr(2, 9),
                message: msg,
                type: toastType,
                count: 1,
                timestamp: Date.now()
            };
            return [...prev, newItem];
        });
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            {/* Render Toasts Container */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id} // Use ID for stability, but timestamp update triggers re-render if needed
                            {...toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
