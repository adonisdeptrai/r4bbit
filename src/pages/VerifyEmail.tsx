import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Check, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'resend'>('checking');
    const [message, setMessage] = useState('Verifying your email...');
    const [email, setEmail] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        // Auto-verify if token is in URL (email link flow)
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (token && type === 'signup') {
            verifyEmailToken(token);
        } else {
            // Manual verification flow - check if user just signed up
            checkVerificationStatus();
        }
    }, [searchParams]);

    const verifyEmailToken = async (token: string) => {
        try {
            if (!supabase) {
                setStatus('error');
                setMessage('Email service not configured');
                return;
            }

            // Verify email with Supabase token from URL
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'signup'
            });

            if (error) throw error;

            if (data.user) {
                // Update public.users is_verified status
                await supabase
                    .from('users')
                    .update({ is_verified: true })
                    .eq('id', data.user.id);

                setStatus('success');
                setMessage('Email verified successfully! Redirecting to login...');

                // Redirect to login after 3 seconds
                setTimeout(() => navigate('/auth'), 3000);
            }
        } catch (err: any) {
            console.error('Verification Error:', err);
            setStatus('error');
            setMessage(err.message || 'Verification failed. Link may be expired.');
        }
    };

    const checkVerificationStatus = async () => {
        try {
            if (!supabase) {
                setStatus('resend');
                setMessage('Please check your email for verification link');
                return;
            }

            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setEmail(session.user.email || '');

                if (session.user.email_confirmed_at) {
                    setStatus('success');
                    setMessage('Email already verified!');
                    setTimeout(() => navigate('/shop'), 2000);
                } else {
                    setStatus('resend');
                    setMessage('Please check your email for verification link');
                }
            } else {
                setStatus('resend');
                setMessage('Please check your email to verify your account');
            }
        } catch (err) {
            setStatus('resend');
            setMessage('Please check your email for verification link');
        }
    };

    const resendVerificationEmail = async () => {
        if (!email) {
            setMessage('Email address not found. Please sign up again.');
            return;
        }

        setResending(true);
        try {
            if (!supabase) throw new Error('Email service not configured');

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) throw error;

            setMessage('Verification email sent! Please check your inbox.');
            setStatus('resend');
        } catch (err: any) {
            console.error('Resend error:', err);
            setMessage(err.message || 'Failed to resend email');
            setStatus('error');
        }
        setResending(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {status === 'checking' && (
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                        )}
                        {status === 'resend' && (
                            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <Mail className="w-8 h-8 text-cyan-400" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center text-white mb-4">
                        {status === 'checking' && 'Verifying Email'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                        {status === 'resend' && 'Check Your Email'}
                    </h2>

                    {/* Message */}
                    <p className="text-center text-slate-300 mb-6">
                        {message}
                    </p>

                    {/* Email Display */}
                    {email && status === 'resend' && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-6 text-center">
                            <p className="text-sm text-slate-400">Sent to:</p>
                            <p className="text-white font-medium">{email}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        {status === 'resend' && (
                            <button
                                onClick={resendVerificationEmail}
                                disabled={resending}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {resending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-5 h-5" />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>
                        )}

                        {status === 'success' && (
                            <button
                                onClick={() => navigate('/shop')}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                Continue to App
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        )}

                        {(status === 'resend' || status === 'error') && (
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                            >
                                Back to Login
                            </button>
                        )}
                    </div>

                    {/* Help Text */}
                    {status === 'resend' && (
                        <p className="text-center text-sm text-slate-400 mt-6">
                            Didn't receive the email? Check your spam folder or click resend.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
