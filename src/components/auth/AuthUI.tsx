import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, LucideIcon, Eye, EyeOff } from 'lucide-react';
import { Button } from '../common';

// ============================================================================
// LIQUID GLASS INPUT
// ============================================================================
interface GlassInputProps {
    label: string;
    icon: LucideIcon;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    rightPadding?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    label,
    icon: Icon,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled = false,
    showPasswordToggle = false,
    showPassword = false,
    onTogglePassword,
    rightPadding = 'pr-4'
}) => {
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>
            <div className="relative group">
                {/* Glow effect on focus */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-cyan/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-300" />

                {/* Glass container */}
                <div
                    className="relative rounded-xl overflow-hidden transition-all duration-300"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
                >
                    <Icon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-cyan transition-colors duration-300"
                        size={18}
                    />
                    <input
                        type={inputType}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        className={`w-full pl-12 ${showPasswordToggle ? 'pr-14' : rightPadding} py-4 bg-transparent text-sm focus:outline-none placeholder:text-slate-600 text-white`}
                        placeholder={placeholder}
                    />
                    {showPasswordToggle && onTogglePassword && (
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ALERT MESSAGE (Error/Success)
// ============================================================================
type AlertVariant = 'error' | 'success';

interface AlertMessageProps {
    message: string | null;
    variant?: AlertVariant;
}

const alertConfig = {
    error: {
        bg: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
        border: '1px solid rgba(239,68,68,0.3)',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        textColor: 'text-red-200',
        Icon: AlertCircle
    },
    success: {
        bg: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
        border: '1px solid rgba(16,185,129,0.3)',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        textColor: 'text-emerald-200',
        Icon: CheckCircle
    }
};

export const AlertMessage: React.FC<AlertMessageProps> = ({ message, variant = 'error' }) => {
    const config = alertConfig[variant];

    return (
        <AnimatePresence mode='wait'>
            {message && (
                <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="relative overflow-hidden rounded-xl"
                    style={{
                        background: config.bg,
                        border: config.border,
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div className="px-4 py-3 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                            <config.Icon size={16} className={config.iconColor} />
                        </div>
                        <span className={`${config.textColor} text-sm font-medium`}>{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// GRADIENT SUBMIT BUTTON
// ============================================================================
interface GradientButtonProps {
    type?: 'button' | 'submit';
    isLoading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'glass';
    className?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    type = 'submit',
    isLoading = false,
    disabled = false,
    onClick,
    children,
    variant = 'primary',
    className = ''
}) => {
    const styles = variant === 'primary'
        ? {
            background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #8b5cf6 100%)',
            boxShadow: '0 10px 40px -10px rgba(34,211,238,0.5), 0 4px 20px -5px rgba(59,130,246,0.4)'
        }
        : {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <Button
                type={type}
                disabled={disabled || isLoading}
                onClick={onClick}
                className={`w-full h-14 relative overflow-hidden rounded-xl font-bold text-white transition-all border-none flex items-center justify-center gap-2 ${className}`}
                style={styles}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
                {isLoading ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <span className="relative z-10 text-base flex items-center gap-2">{children}</span>
                )}
            </Button>
        </motion.div>
    );
};

// ============================================================================
// AUTH FORM HEADER
// ============================================================================
interface FormHeaderProps {
    title: string;
    subtitle: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => (
    <div className="text-center mb-8">
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                {title}
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
                {subtitle}
            </p>
        </motion.div>
    </div>
);

// ============================================================================
// GOOGLE AUTH BUTTON
// ============================================================================
interface GoogleButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleButtonProps> = ({ onClick, disabled = false }) => (
    <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-14 relative overflow-hidden rounded-2xl flex items-center justify-center gap-3 transition-all font-medium text-sm text-white group mb-6"
        style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 0.8s ease' }} />
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="font-semibold">Continue with Google</span>
    </motion.button>
);

// ============================================================================
// DIVIDER
// ============================================================================
interface DividerProps {
    text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = 'Or continue with email' }) => (
    <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="px-4 text-slate-500 bg-transparent backdrop-blur-sm">
                {text}
            </span>
        </div>
    </div>
);

// ============================================================================
// MOBILE TOGGLE LINK
// ============================================================================
interface MobileToggleProps {
    text: string;
    linkText: string;
    onClick: () => void;
}

export const MobileToggle: React.FC<MobileToggleProps> = ({ text, linkText, onClick }) => (
    <div className="mt-8 text-center md:hidden">
        <p className="text-sm text-slate-500">
            {text}{' '}
            <button
                type="button"
                onClick={onClick}
                className="text-brand-cyan font-bold hover:text-white transition-colors ml-1"
            >
                {linkText}
            </button>
        </p>
    </div>
);
