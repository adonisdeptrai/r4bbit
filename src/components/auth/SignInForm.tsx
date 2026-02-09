import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
    GlassInput,
    AlertMessage,
    GradientButton,
    FormHeader,
    GoogleAuthButton,
    Divider,
    MobileToggle
} from './AuthUI';

interface SignInFormProps {
    onForgotPassword: () => void;
    onToggleMode: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onForgotPassword, onToggleMode }) => {
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("All fields are required");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        }
        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 md:p-10 relative z-10">
            <FormHeader
                title="Welcome Back"
                subtitle="Sign in to continue your journey"
            />

            <GoogleAuthButton onClick={handleGoogleLogin} disabled={isLoading} />
            <Divider />

            <form onSubmit={handleSubmit} className="space-y-5">
                <AlertMessage message={error} variant="error" />

                <GlassInput
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="name@example.com"
                    disabled={isLoading}
                />

                <GlassInput
                    label="Password"
                    icon={Lock}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                />

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-brand-cyan hover:text-cyan-300 transition-colors font-medium hover:underline underline-offset-2"
                    >
                        Forgot Password?
                    </button>
                </div>

                <GradientButton type="submit" isLoading={isLoading}>
                    Sign In
                </GradientButton>

                <MobileToggle
                    text="Don't have an account?"
                    linkText="Sign up for free"
                    onClick={onToggleMode}
                />
            </form>
        </div>
    );
};
