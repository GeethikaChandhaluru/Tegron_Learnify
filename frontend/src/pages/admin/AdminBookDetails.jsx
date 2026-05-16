import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import { getBook, addReply, getFileUrl } from '../../services/api';
import toast from 'react-hot-toast';

// ── Admin badge component ────────────────────────────────────────────────────
function AdminBadge() {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: 'linear-gradient(135deg, #0A2238, #28c7d9)',
            color: '#fff', fontSize: '0.65rem', fontWeight: 700,
            padding: '2px 7px', borderRadius: 20, letterSpacing: '0.03em',
            marginLeft: 6, verticalAlign: 'middle',
        }}>
            🛡 Admin
        </span>
    );
}

// ── Single reply (recursive) ─────────────────────────────────────────────────
function ReplyItem({ reply, depth = 0 }) {
    return (
        <div style={{
            marginLeft: depth > 0 ? 24 : 0,
            paddingLeft: 12,
            borderLeft: depth > 0 ? '2px solid var(--border-gray)' : 'none',
            marginTop: 10,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--navy)' }}>
                    {reply.username || 'Unknown'}
                </span>
                {reply.isAdmin && <AdminBadge />}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {new Date(reply.createdAt).toLocaleString()}
                </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {reply.text}
            </p>
            {/* Render nested children */}
            {reply.children && reply.children.map(child => (
                <ReplyItem key={child._id} reply={child} depth={depth + 1} />
            ))}
        </div>
    );
}

// ── Build nested reply tree from flat array ──────────────────────────────────
function buildReplyTree(flatReplies = []) {
    const map = {};
    const roots = [];
    flatReplies.forEach(r => { map[r._id] = { ...r, children: [] }; });
    flatReplies.forEach(r => {
        const pid = r.parentReplyId ? r.parentReplyId.toString() : null;
        if (pid && map[pid]) map[pid].children.push(map[r._id]);
        else roots.push(map[r._id]);
    });
    return roots;
}

// ── Single comment card ──────────────────────────────────────────────────────
function CommentCard({ comment, bookId, onReplyPosted }) {
    const [replyText, setReplyText] = useState('');
    const [posting, setPosting] = useState(false);
    const [showReplyBox, setShowReplyBox] = useState(false);

    const replyTree = buildReplyTree(comment.replies || []);

    const handlePostReply = async () => {
        if (!replyText.trim()) return;
        setPosting(true);
        try {
            const { data } = await addReply(bookId, comment._id, replyText.trim());
            toast.success('Reply posted');
            setReplyText('');
            setShowReplyBox(false);
            onReplyPosted(data.comments);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post reply');
        } finally {
            setPosting(false);
        }
    };

    return (
        <div style={{
            background: '#fff', border: '1.5px solid var(--border-gray)',
            borderRadius: 12, padding: 16, marginBottom: 14,
        }}>
            {/* Comment header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--navy)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                }}>
                    {(comment.username || 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--navy)' }}>
                    {comment.username || 'Unknown'}
                </span>
                {comment.isAdmin && <AdminBadge />}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                    {new Date(comment.createdAt).toLocaleString()}
                </span>
            </div>

            {/* Comment text */}
            <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {comment.text}
            </p>

            {/* Likes count */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                ❤️ {(comment.commentLikes || []).length} likes
            </div>

            {/* Existing replies */}
            {replyTree.length > 0 && (
                <div style={{
                    marginTop: 10, paddingTop: 10,
                    borderTop: '1px solid var(--border-gray)',
                }}>
                    {replyTree.map(reply => (
                        <ReplyItem key={reply._id} reply={reply} depth={0} />
                    ))}
                </div>
            )}

            {/* Admin reply box */}
            <div style={{ marginTop: 12 }}>
                {!showReplyBox ? (
                    <button
                        onClick={() => setShowReplyBox(true)}
                        style={{
                            background: 'none', border: '1.5px solid var(--cyan)',
                            color: 'var(--cyan)', borderRadius: 8, padding: '5px 14px',
                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        💬 Reply as Admin
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write an admin reply…"
                            style={{
                                flex: 1, minWidth: 160, padding: '8px 12px',
                                border: '1.5px solid var(--cyan)', borderRadius: 8,
                                fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
                            }}
                            onKeyDown={e => e.key === 'Enter' && handlePostReply()}
                        />
                        <button
                            onClick={handlePostReply}
                            disabled={posting || !replyText.trim()}
                            style={{
                                background: 'var(--cyan)', color: '#fff',
                                border: 'none', borderRadius: 8, padding: '8px 16px',
                                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            {posting ? '…' : 'Post'}
                        </button>
                        <button
                            onClick={() => { setShowReplyBox(false); setReplyText(''); }}
                            style={{
                                background: 'none', border: '1.5px solid var(--border-gray)',
                                borderRadius: 8, padding: '8px 12px',
                                fontSize: '0.82rem', cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminBookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBook(id)
            .then(({ data }) => setBook(data.data))
            .catch(() => { toast.error('Book not found'); navigate('/admin/manage-books'); })
            .finally(() => setLoading(false));
    }, [id]);

    const handleReplyPosted = (updatedComments) => {
        setBook(prev => ({ ...prev, comments: updatedComments }));
    };

    if (loading) return <AdminLayout><Loader /></AdminLayout>;
    if (!book) return null;

    const thumbnail = getFileUrl(book.thumbnail);
    const pdfUrl = book.pdfFile ? getFileUrl(book.pdfFile) : book.bookUrl || null;

    return (
        <AdminLayout>
            <button className="back-btn" onClick={() => navigate('/admin/manage-books')}>
                ← Back to Manage Books
            </button>

            {/* ── Book Info Card ──────────────────────────────────────── */}
            <div style={{
                background: '#fff', border: '1.5px solid var(--border-gray)',
                borderRadius: 16, padding: 24, marginBottom: 28,
                display: 'flex', gap: 24, flexWrap: 'wrap',
            }}>
                {/* Thumbnail */}
                <div style={{ flexShrink: 0 }}>
                    {thumbnail ? (
                        <img src={thumbnail} alt={book.title}
                            style={{ width: 110, height: 140, objectFit: 'cover', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
                    ) : (
                        <div style={{
                            width: 110, height: 140, background: 'var(--navy)', borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem',
                        }}>📖</div>
                    )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 180 }}>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', color: 'var(--navy)', fontWeight: 800 }}>
                        {book.title}
                    </h2>
                    <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {book.description}
                    </p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--orange-red)', fontSize: '1.1rem' }}>
                            {book.price === 0 ? 'FREE' : `₹${book.price.toFixed(2)}`}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            by {book.author || '—'}
                        </span>
                        <span className="badge badge-success">{book.category || 'General'}</span>
                    </div>

                    {/* PDF Link */}
                    {pdfUrl && (
                        <div style={{ marginTop: 12 }}>
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '7px 16px', borderRadius: 8,
                                    background: 'var(--navy)', color: '#fff',
                                    fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
                                }}
                            >
                                📄 View PDF / Book
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Engagement Stats ────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <div style={{
                    background: '#fff', border: '1.5px solid var(--border-gray)',
                    borderRadius: 12, padding: '16px 24px', display: 'flex',
                    alignItems: 'center', gap: 12, minWidth: 130,
                }}>
                    <span style={{ fontSize: '1.6rem' }}>❤️</span>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>
                            {book.likes || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Likes</div>
                    </div>
                </div>
                <div style={{
                    background: '#fff', border: '1.5px solid var(--border-gray)',
                    borderRadius: 12, padding: '16px 24px', display: 'flex',
                    alignItems: 'center', gap: 12, minWidth: 130,
                }}>
                    <span style={{ fontSize: '1.6rem' }}>💬</span>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>
                            {(book.comments || []).length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Comments</div>
                    </div>
                </div>
            </div>

            {/* ── Comments Section ─────────────────────────────────────── */}
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
                    💬 All Comments
                </h3>

                {(book.comments || []).length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: 40,
                        color: 'var(--text-secondary)', background: '#fff',
                        border: '1.5px solid var(--border-gray)', borderRadius: 12,
                    }}>
                        No comments yet
                    </div>
                ) : (
                    [...book.comments].reverse().map(comment => (
                        <CommentCard
                            key={comment._id}
                            comment={comment}
                            bookId={book._id}
                            onReplyPosted={handleReplyPosted}
                        />
                    ))
                )}
            </div>
        </AdminLayout>
    );
}