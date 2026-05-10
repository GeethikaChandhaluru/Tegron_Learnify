import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userData = await login(form.email, form.password);
            if (userData.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Wrong credentials entered');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-brand">
                <div className="auth-brand-logo">Tegron <span>Learnify</span></div>
                <p className="auth-brand-tagline">
                    Your ultimate digital library. Thousands of books, one platform.
                    Learn, grow, and read at your own pace.
                </p>
                <div className="auth-brand-deco">
                    {['📚 10,000+ Books', '⚡ Instant Access', '🎓 Student Friendly', '💳 Secure Payments'].map(t => (
                        <span key={t} className="auth-brand-deco-tag">{t}</span>
                    ))}
                </div>
            </div>

            <div className="auth-form-area">
                <div className="auth-card">
                    <h2>Welcome Back</h2>
                    <p className="subtitle">Sign in to your Tegron Learnify account</p>

                    {error && <div className="error-msg">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
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
                                onChange={handleChange} required
                            />
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 500 }}>
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In →'}
                        </button>
                    </form>

                    <div className="auth-links">
                        Don't have an account?{' '}
                        <Link to="/signup">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
