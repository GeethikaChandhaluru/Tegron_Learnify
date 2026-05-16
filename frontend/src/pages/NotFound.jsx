import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,var(--navy),var(--dark-blue))',
            color: 'white', textAlign: 'center', padding: 24,
        }}>
            <div style={{ fontSize: '6rem', marginBottom: 16 }}>📚</div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '4rem', fontWeight: 800, color: 'var(--cyan)', marginBottom: 8 }}>
                404
            </h1>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.5rem', marginBottom: 12 }}>Page Not Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, maxWidth: 380 }}>
                Looks like this page got lost in the library stacks. Let's get you back on track.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
                ← Back to Home
            </button>
        </div>
    );
}
