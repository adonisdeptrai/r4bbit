const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET is not defined.');
}

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const validator = require('validator');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Register
router.post('/register', authLimiter, [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const { data: existingUsers } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${email},username.eq.${username}`)
            .limit(1);

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit OTP
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password: hashedPassword,
                is_verified: false,
                verification_token: verificationToken
            }])
            .select()
            .single();

        if (error) throw error;

        // Email Sending Logic
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
        const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

        console.log('--- VERIFICATION LINK (DEBUG) ---');
        console.log(verificationUrl);
        console.log('---------------------------------');

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify your R4B Account',
                html: `
                    <h1>Welcome to R4B!</h1>
                    <p>Your verification code is:</p>
                    <h2 style="color: #06b6d4; font-size: 32px; letter-spacing: 5px;">${verificationToken}</h2>
                    <p>Enter this code on the website to verify your account.</p>
                `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        } else {
            console.log('---------------------------------------------------');
            console.log('NO SMTP CONFIGURED. VERIFICATION LINK:');
            console.log(verificationUrl);
            console.log('---------------------------------------------------');
        }

        res.status(201).json({ message: 'User created successfully. Please check your email to verify account.' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify Email
router.post('/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ message: 'Email and Code are required' });

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.is_verified) return res.status(400).json({ message: 'User already verified' });

        if (user.verification_token !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        const { error } = await supabase
            .from('users')
            .update({
                is_verified: true,
                verification_token: null
            })
            .eq('email', email);

        if (error) throw error;

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify Email via Token (GET method for URL verification)
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        // Find user with this token
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('verification_token', token)
            .single();

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: 'Email already verified. You can login now.' });
        }

        // Verify user
        const { error } = await supabase
            .from('users')
            .update({
                is_verified: true,
                verification_token: null
            })
            .eq('verification_token', token);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Email verified successfully! You can now login.'
        });
    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Forgot Password
router.post('/forgot-password', [
    body('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { email } = req.body;

        // Find user by email
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        // SECURITY: Always return success message (don't reveal if email exists)
        // This prevents email enumeration attacks
        if (!user) {
            return res.json({
                success: true,
                message: 'If that email exists, a password reset link has been sent.'
            });
        }

        // Generate secure reset token (32 bytes = 64 hex characters)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before saving to DB (prevent DB leak attack)
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token + expiry (30 minutes)
        const { error } = await supabase
            .from('users')
            .update({
                reset_password_token: hashedToken,
                reset_password_expires: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            })
            .eq('email', email);

        if (error) throw error;

        // Create reset URL with raw token (user receives unhashed version)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
        const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

        console.log('--- PASSWORD RESET LINK (DEBUG) ---');
        console.log(resetUrl);
        console.log('------------------------------------');

        // Send email if SMTP configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request - R4B',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>You requested to reset your password for your R4B account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #06b6d4; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
                    <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                    <p><strong>This link will expire in 30 minutes.</strong></p>
                    <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">This is an automated email from R4B Platform.</p>
                `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending password reset email:', err);
                } else {
                    console.log('Password reset email sent:', info.response);
                }
            });
        } else {
            console.log('---------------------------------------------------');
            console.log('NO SMTP CONFIGURED. PASSWORD RESET LINK:');
            console.log(resetUrl);
            console.log('---------------------------------------------------');
        }

        res.json({
            success: true,
            message: 'If that email exists, a password reset link has been sent.'
        });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reset Password
router.post('/reset-password/:token', [
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('confirmPassword', 'Please confirm your password').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the token from URL to match DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by token AND check expiry
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('reset_password_token', hashedToken)
            .gt('reset_password_expires', new Date().toISOString())
            .single();

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired reset token. Please request a new password reset.'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset fields
        const { error } = await supabase
            .from('users')
            .update({
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            })
            .eq('id', user.id);

        if (error) throw error;

        // Optional: Send confirmation email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Changed Successfully - R4B',
                html: `
                    <h1>Password Changed</h1>
                    <p>Your password for <strong>${user.username}</strong> has been successfully changed.</p>
                    <p>If you did not make this change, please contact support immediately.</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">This is an automated email from R4B Platform.</p>
                `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending confirmation email:', err);
                } else {
                    console.log('Password change confirmation sent:', info.response);
                }
            });
        }

        res.json({
            success: true,
            message: 'Password has been reset successfully! You can now login with your new password.'
        });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
router.post('/login', [
    body('username', 'Username is required').exists(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    try {
        const { username, password } = req.body;

        // Check user
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Check verification (Enforce Mechanism)
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email first. Check your inbox.' });
        }

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                balance: user.balance
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

const tpbankClient = require('../utils/tpbank');

// Verify Payment Route
router.post('/verify-payment', auth, async (req, res) => {
    try {
        const { orderId, paymentCode, amount } = req.body;

        // Load bank settings from DB
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (!settings || !settings.bank_config || !settings.bank_config.username || !settings.bank_config.password || !settings.bank_config.accountNo) {
            return res.status(400).json({ msg: 'Bank settings not configured' });
        }

        const bankConfig = settings.bank_config;

        // Call TPBank API
        const deviceId = bankConfig.deviceId || 'static-device-id-if-needed';

        const history = await tpbankClient.getHistories(
            null, // Let client manage token
            bankConfig.accountNo,
            deviceId,
            bankConfig.username,
            bankConfig.password
        );

        // Filter for matching transaction
        if (history && history.transactionInfos) {
            const match = history.transactionInfos.find(t => {
                return t.description.includes(paymentCode) &&
                    Math.abs(parseFloat(t.amount) - parseFloat(amount)) < 1000;
            });

            if (match) {
                return res.json({
                    verified: true,
                    transaction: match
                });
            }
        }

        return res.json({ verified: false, msg: 'Transaction not found yet' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
