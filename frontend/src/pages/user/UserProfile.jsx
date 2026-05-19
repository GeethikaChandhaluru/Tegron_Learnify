import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

// Convert a File object → base64 data URL string
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// Resolve avatar src — handles base64 data URLs, absolute URLs, and relative paths
const BASE_URL = 'https://tegron-learnify.onrender.com';
const resolveAvatar = (profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith('data:') || profilePic.startsWith('http')) return profilePic;
    return `${BASE_URL}${profilePic}`;
};

export default function UserProfile() {
    const { user, updateUser } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [imgError, setImgError] = useState(false);
    const fileRef = useRef();

    useEffect(() => {
        if (user?.username) setUsername(user.username);
    }, [user?.username]);

    useEffect(() => { setImgError(false); }, [user?.profilePic]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const b64 = await fileToBase64(file);
        setPreview(b64);
        setImgError(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { username };
            if (preview) payload.profilePic = preview;
            const { data } = await updateProfile(payload);
            updateUser(data.data);
            toast.success('Profile updated! ✅');
            setPreview(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const imgSrc = preview || (!imgError ? resolveAvatar(user?.profilePic) : null);
    const initial = user?.username?.[0]?.toUpperCase() || '?';

    return (
        <>
            <Navbar />
            <div className="app-container" style={{ paddingTop: 40, paddingBottom: 60 }}>
                <h1 style={{ fontFamily: 'Syne,sans-serif', color: 'var(--navy)', marginBottom: 8 }}>
                    My Profile
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                    Manage your account details and wallet balance.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>

                    <div style={cardStyle}>
                        <h3 style={sectionTitle}>Account Details</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div
                                onClick={() => fileRef.current?.click()}
                                title="Click to change photo"
                                style={{
                                    width: 90, height: 90, borderRadius: '50%',
                                    background: imgSrc ? '#e2e8f0' : 'var(--cyan)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', overflow: 'hidden',
                                    border: '3px solid var(--cyan)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    flexShrink: 0,
                                }}
                            >
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt="avatar"
                                        onError={() => setImgError(true)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif', lineHeight: 1, userSelect: 'none' }}>
                                        {initial}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {preview ? '📷 Ready to save' : 'Click photo to change'}
                            </span>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Username</label>
                                <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} placeholder="Your username" />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input value={user?.email || ''} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Role</label>
                                <input value={user?.role || ''} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }} />
                            </div>
                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, var(--navy), #1a4a7a)' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: 8 }}>💰 Wallet Balance</p>
                            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif' }}>
                                ₹{(user?.balance ?? 100).toFixed(2)}
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', marginTop: 8 }}>New users receive ₹100 on signup.</p>
                        </div>

                        <div style={cardStyle}>
                            <h3 style={sectionTitle}>Account Stats</h3>
                            {[
                                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                                { label: 'Account Type', value: user?.role === 'admin' ? '🛡️ Admin' : '👤 User' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-gray)' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.85rem' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

const cardStyle = { background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gray)', padding: 28, boxShadow: 'var(--shadow-sm)' };
const sectionTitle = { fontFamily: 'Syne,sans-serif', color: 'var(--navy)', fontSize: '1rem', marginBottom: 20 };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-gray)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--navy)', background: '#f9fafb', boxSizing: 'border-box', outline: 'none' };