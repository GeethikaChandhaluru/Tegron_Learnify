import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../services/api';
import toast from 'react-hot-toast';

export default function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        try {
            await signup({ username: form.username, email: form.email, password: form.password });
            // Do NOT store token or log in — redirect to login instead
            toast.success('Account created successfully. Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-brand">
                <div className="auth-brand-logo">Tegron <span>Notes</span></div>
                <p className="auth-brand-tagline">
                    Join thousands of students who trust Tegron Notes for their learning journey.
                </p>
                <div className="auth-brand-deco">
                    {['📖 Read Anywhere', '🔒 Secure', '💡 Expert Authors', '🌍 Any Device'].map(t => (
                        <span key={t} className="auth-brand-deco-tag">{t}</span>
                    ))}
                </div>
            </div>

            <div className="auth-form-area">
                <div className="auth-card">
                    <h2>Create Account</h2>
                    <p className="subtitle">Start your reading journey today</p>

                    {error && <div className="error-msg">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text" name="username" value={form.username}
                                onChange={handleChange} required minLength={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email" name="email" value={form.email}
                                onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password" name="password" value={form.password}
                                onChange={handleChange} required minLength={6}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Creating account…' : 'Create Account →'}
                        </button>
                    </form>

                    <div className="auth-links">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}