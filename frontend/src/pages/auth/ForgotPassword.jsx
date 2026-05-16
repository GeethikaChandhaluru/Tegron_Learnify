import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await forgotPassword({ email });
            setSent(true);
            toast.success('Reset link sent! Check your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-brand">
                <div className="auth-brand-logo">Tegron <span>Notes</span></div>
                <p className="auth-brand-tagline">
                    No worries! We'll send you a reset link to your registered email address.
                </p>
            </div>

            <div className="auth-form-area">
                <div className="auth-card">
                    {sent ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📬</div>
                            <h2 style={{ marginBottom: '12px' }}>Check Your Email</h2>
                            <p className="subtitle">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <Link to="/login" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2>Forgot Password?</h2>
                            <p className="subtitle">Enter your email to receive a reset link</p>

                            {error && <div className="error-msg">⚠️ {error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email" value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        placeholder="you@example.com" required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Sending…' : 'Send Reset Link →'}
                                </button>
                            </form>

                            <div className="auth-links">
                                Remember your password?{' '}
                                <Link to="/login">Sign in</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
