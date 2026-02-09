import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    GlassInput,
    AlertMessage,
    GradientButton,
    FormHeader,
    MobileToggle
} from './AuthUI';

interface SignUpFormProps {
    onToggleMode: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
    const { register } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password strength check
    const passwordStrength = React.useMemo(() => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }, [password]);

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength === 3) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (passwordStrength < 2) {
            setError("Password is too weak");
            return;
        }

        setIsLoading(true);
        try {
            await register(username, email, password);
            navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message || "Registration failed");
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 md:p-10 relative z-10">
            <FormHeader
                title="Create Account"
                subtitle="Join the automation revolution"
            />

            <form onSubmit={handleSubmit} className="space-y-5">
                <AlertMessage message={error} variant="error" />

                <GlassInput
                    label="Username"
                    icon={User}
                    value={username}
                    onChange={setUsername}
                    placeholder="Choose a username"
                    disabled={isLoading}
                />

                <GlassInput
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="name@example.com"
                    disabled={isLoading}
                />

                {/* Password with strength indicator */}
                <div>
                    <GlassInput
                        label="Password"
                        icon={Lock}
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Create a strong password"
                        disabled={isLoading}
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                    />

                    {/* Password Strength Indicator */}
                    {password && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                        >
                            <div className="flex gap-1.5 mb-1.5">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? getStrengthColor() : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-slate-500">
                                {passwordStrength <= 1 && 'Weak - add uppercase, numbers, symbols'}
                                {passwordStrength === 2 && 'Fair - add more variety'}
                                {passwordStrength === 3 && 'Good - almost there'}
                                {passwordStrength === 4 && (
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Strong password
                                    </span>
                                )}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Confirm Password with match indicator */}
                <div>
                    <GlassInput
                        label="Confirm Password"
                        icon={Lock}
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                        showPasswordToggle
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />

                    {/* Password match indicator */}
                    {confirmPassword && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`text-xs ml-1 mt-2 flex items-center gap-1 ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {password === confirmPassword ? (
                                <><CheckCircle2 size={12} /> Passwords match</>
                            ) : (
                                <><AlertCircle size={12} /> Passwords don't match</>
                            )}
                        </motion.p>
                    )}
                </div>

                <div className="pt-2">
                    <GradientButton type="submit" isLoading={isLoading}>
                        Create Account
                    </GradientButton>
                </div>

                <MobileToggle
                    text="Already have an account?"
                    linkText="Sign in"
                    onClick={onToggleMode}
                />
            </form>
        </div>
    );
};
