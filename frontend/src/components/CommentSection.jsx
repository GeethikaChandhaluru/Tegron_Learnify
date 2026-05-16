import { useState, useCallback } from 'react';
import {
    addComment,
    deleteComment,
    likeComment,
    addReply,
    deleteReply,
    likeReply,
} from '../services/api';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely compare two user-id values (ObjectId string, plain string, or {_id} object) */
const isSameUser = (a, b) => {
    if (!a || !b) return false;
    const sa = ((a?._id ?? a) || '').toString();
    const sb = ((b?._id ?? b) || '').toString();
    return sa.length > 0 && sa === sb;
};

/**
 * Convert the flat reply array stored in MongoDB into a nested tree.
 * Each node gets a `.children` array of direct child nodes.
 *
 * flat: [
 *   { _id, parentReplyId: null, ... },        // root reply
 *   { _id, parentReplyId: '<root id>', ... },  // reply-to-reply
 *   ...
 * ]
 */
const buildReplyTree = (flatReplies = []) => {
    const map = {};
    const roots = [];

    // First pass: index everything
    flatReplies.forEach((r) => {
        map[r._id] = { ...r, children: [] };
    });

    // Second pass: link children to parents
    flatReplies.forEach((r) => {
        const pid = r.parentReplyId ? r.parentReplyId.toString() : null;
        if (pid && map[pid]) {
            map[pid].children.push(map[r._id]);
        } else {
            roots.push(map[r._id]); // no valid parent → treat as root
        }
    });

    return roots;
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirm({ message, onYes, onNo }) {
    return (
        <div className="cs-modal-overlay">
            <div className="cs-modal-box">
                <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>🗑️</div>
                <h4 className="cs-modal-title">{message}</h4>
                <p className="cs-modal-sub">This action cannot be undone.</p>
                <div className="cs-modal-actions">
                    <button className="btn btn-outline" style={{ minWidth: '90px' }} onClick={onNo}>
                        No, Cancel
                    </button>
                    <button className="cs-btn-danger" onClick={onYes}>
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, small = false }) {
    return (
        <div className={small ? 'cs-avatar cs-avatar-sm' : 'cs-avatar'}>
            {(name || 'U')[0].toUpperCase()}
        </div>
    );
}

// ─── ReplyItem (recursive) ────────────────────────────────────────────────────
// depth=0  → direct reply to a comment  (rendered inside cs-replies-list)
// depth=1+ → reply to a reply            (rendered with extra left indent)
// MAX_DEPTH controls when indentation stops growing (UI cap only; data is unlimited)
const MAX_DEPTH = 5;

function ReplyItem({
    reply,
    bookId,
    commentId,
    currentUserId,
    onUpdate,
    depth,
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [likePending, setLikePending] = useState(false);

    const canDelete = isSameUser(reply.user, currentUserId);
    const isLiked = currentUserId
        ? (reply.replyLikes || []).some((id) => isSameUser(id, currentUserId))
        : false;
    const likeCount = (reply.replyLikes || []).length;

    // ── handlers ──────────────────────────────────────────────────────────────

    const handleLike = useCallback(async () => {
        if (!currentUserId) return toast.error('Please log in to like');
        if (likePending) return;
        setLikePending(true);
        try {
            const { data } = await likeReply(bookId, commentId, reply._id);
            onUpdate(data.comments);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Like failed');
        } finally {
            setLikePending(false);
        }
    }, [bookId, commentId, reply._id, currentUserId, likePending, onUpdate]);

    const handleReply = useCallback(async () => {
        if (!replyText.trim()) return toast.error('Reply cannot be empty');
        setSubmitting(true);
        try {
            // Pass this reply's _id as parentReplyId → nested reply
            const { data } = await addReply(bookId, commentId, replyText.trim(), reply._id);
            onUpdate(data.comments);
            setReplyText('');
            setShowReplyBox(false);
            toast.success('Reply added');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    }, [bookId, commentId, reply._id, replyText, onUpdate]);

    const handleDelete = useCallback(async () => {
        setConfirmDelete(false);
        try {
            const { data } = await deleteReply(bookId, commentId, reply._id);
            onUpdate(data.comments);
            toast.success('Reply deleted');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete reply');
        }
    }, [bookId, commentId, reply._id, onUpdate]);

    // ── render ────────────────────────────────────────────────────────────────

    // Visual indent cap — stop growing indentation beyond MAX_DEPTH
    const indentPx = Math.min(depth, MAX_DEPTH) * 20;

    return (
        <div style={{ marginLeft: depth > 0 ? indentPx : 0 }}>
            <div
                className="cs-reply-card"
                style={{
                    borderLeftColor: depth % 2 === 0
                        ? 'var(--cyan, #28C7D9)'
                        : 'var(--orange-red, #F04A2A)',
                }}
            >
                {/* Header */}
                <div className="cs-comment-header">
                    <Avatar name={reply.username} small />
                    <div className="cs-comment-meta">
                        <span className="cs-username">{reply.username || 'User'}</span>
                        {reply.isAdmin && <span className="admin-reply-badge">🛡 Admin</span>}
                        <span className="cs-date">
                            {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Text */}
                <p className="cs-reply-text">{reply.text}</p>

                {/* Action bar */}
                <div className="cs-reply-actions" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {/* Like */}
                    <button
                        className={`cs-action-btn cs-btn-like${isLiked ? ' liked' : ''}`}
                        onClick={handleLike}
                        disabled={likePending}
                        title={isLiked ? 'Unlike' : 'Like this reply'}
                    >
                        {isLiked ? '❤️' : '🤍'}
                        {likeCount > 0 && <span>{likeCount}</span>}
                    </button>

                    {/* Reply */}
                    {currentUserId && (
                        <button
                            className="cs-action-btn cs-btn-reply"
                            onClick={() => setShowReplyBox(!showReplyBox)}
                        >
                            💬 {showReplyBox ? 'Cancel' : 'Reply'}
                        </button>
                    )}

                    {/* Delete */}
                    {canDelete && (
                        <button
                            className="cs-action-btn cs-btn-delete"
                            onClick={() => setConfirmDelete(true)}
                        >
                            🗑️ Delete
                        </button>
                    )}
                </div>

                {/* Nested reply input */}
                {showReplyBox && (
                    <div
                        className="cs-reply-input-row"
                        style={{ marginTop: '10px', paddingLeft: 0 }}
                    >
                        <input
                            type="text"
                            className="cs-input"
                            placeholder={`Reply to ${reply.username || 'User'}…`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && !submitting && handleReply()
                            }
                            autoFocus
                        />
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '8px 16px', flexShrink: 0 }}
                            onClick={handleReply}
                            disabled={submitting}
                        >
                            {submitting ? '…' : 'Reply'}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Recursive children (replies-to-this-reply) ── */}
            {reply.children && reply.children.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                    {reply.children.map((child) => (
                        <ReplyItem
                            key={child._id}
                            reply={child}
                            bookId={bookId}
                            commentId={commentId}
                            currentUserId={currentUserId}
                            onUpdate={onUpdate}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
                <DeleteConfirm
                    message="Do you really want to delete this reply?"
                    onYes={handleDelete}
                    onNo={() => setConfirmDelete(false)}
                />
            )}
        </div>
    );
}

// ─── CommentItem ──────────────────────────────────────────────────────────────

function CommentItem({ comment, bookId, currentUserId, onUpdate }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [likePending, setLikePending] = useState(false);

    const canDelete = isSameUser(comment.user, currentUserId);
    const isLiked = currentUserId
        ? (comment.commentLikes || []).some((id) => isSameUser(id, currentUserId))
        : false;
    const likeCount = (comment.commentLikes || []).length;

    // Build tree from flat reply array — memoised by comment.replies reference
    const replyTree = buildReplyTree(comment.replies || []);

    const handleDelete = async () => {
        setConfirmDelete(false);
        try {
            const { data } = await deleteComment(bookId, comment._id);
            onUpdate(data.comments);
            toast.success('Comment deleted');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete comment');
        }
    };

    const handleLike = async () => {
        if (!currentUserId) return toast.error('Please log in to like');
        if (likePending) return;
        setLikePending(true);
        try {
            const { data } = await likeComment(bookId, comment._id);
            onUpdate(data.comments);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Like failed');
        } finally {
            setLikePending(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return toast.error('Reply cannot be empty');
        setSubmitting(true);
        try {
            // parentReplyId = null → direct reply to the comment
            const { data } = await addReply(bookId, comment._id, replyText.trim(), null);
            onUpdate(data.comments);
            setReplyText('');
            setShowReplyBox(false);
            toast.success('Reply added');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add reply');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="cs-comment-card">
            {/* Header */}
            <div className="cs-comment-header">
                <Avatar name={comment.username} />
                <div className="cs-comment-meta">
                    <span className="cs-username">{comment.username || 'User'}</span>
                    {comment.isAdmin && <span className="admin-reply-badge">🛡 Admin</span>}
                    <span className="cs-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Body */}
            <p className="cs-comment-text">{comment.text}</p>

            {/* Action bar */}
            <div className="cs-actions">
                {/* Like */}
                <button
                    className={`cs-action-btn cs-btn-like${isLiked ? ' liked' : ''}`}
                    onClick={handleLike}
                    disabled={likePending}
                    title={isLiked ? 'Unlike' : 'Like'}
                >
                    {isLiked ? '❤️' : '🤍'}
                    {likeCount > 0 && <span>{likeCount}</span>}
                </button>

                {/* Reply */}
                {currentUserId && (
                    <button
                        className="cs-action-btn cs-btn-reply"
                        onClick={() => setShowReplyBox(!showReplyBox)}
                    >
                        💬 {showReplyBox ? 'Cancel' : 'Reply'}
                    </button>
                )}

                {/* Delete */}
                {canDelete && (
                    <button
                        className="cs-action-btn cs-btn-delete"
                        onClick={() => setConfirmDelete(true)}
                    >
                        🗑️ Delete
                    </button>
                )}
            </div>

            {/* Reply input for direct replies */}
            {showReplyBox && (
                <div className="cs-reply-input-row">
                    <input
                        type="text"
                        className="cs-input"
                        placeholder="Write a reply…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && !submitting && handleReply()
                        }
                        autoFocus
                    />
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.82rem', padding: '9px 18px', flexShrink: 0 }}
                        onClick={handleReply}
                        disabled={submitting}
                    >
                        {submitting ? '…' : 'Reply'}
                    </button>
                </div>
            )}

            {/* Reply tree (recursive) */}
            {replyTree.length > 0 && (
                <div className="cs-replies-list">
                    {replyTree.map((node) => (
                        <ReplyItem
                            key={node._id}
                            reply={node}
                            bookId={bookId}
                            commentId={comment._id}
                            currentUserId={currentUserId}
                            onUpdate={onUpdate}
                            depth={0}
                        />
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
                <DeleteConfirm
                    message="Do you really want to delete this comment?"
                    onYes={handleDelete}
                    onNo={() => setConfirmDelete(false)}
                />
            )}
        </div>
    );
}

// ─── Main CommentSection ──────────────────────────────────────────────────────

export default function CommentSection({ bookId, comments, currentUserId, onCommentsUpdate }) {
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!commentText.trim()) return toast.error('Please enter a comment');
        setSubmitting(true);
        try {
            const { data } = await addComment(bookId, commentText.trim());
            onCommentsUpdate(data.comments);
            setCommentText('');
            toast.success('Comment added!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="cs-section">
            {/* Heading */}
            <div className="cs-heading">
                <h3>💬 Comments</h3>
                {comments?.length > 0 && (
                    <span className="cs-count-badge">{comments.length}</span>
                )}
            </div>

            <div className="cs-divider" />

            {/* Add comment */}
            {currentUserId ? (
                <div className="cs-add-row">
                    <input
                        type="text"
                        className="cs-input"
                        placeholder="Write your comment…"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && !submitting && handleSubmit()
                        }
                    />
                    <button
                        className="btn btn-primary"
                        style={{ padding: '12px 24px', flexShrink: 0 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? '…' : 'Post'}
                    </button>
                </div>
            ) : (
                <p className="cs-login-prompt">
                    Please <strong>log in</strong> to leave a comment.
                </p>
            )}

            {/* Comment list — newest first */}
            <div className="cs-list">
                {comments && comments.length > 0 ? (
                    [...comments].reverse().map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            bookId={bookId}
                            currentUserId={currentUserId}
                            onUpdate={onCommentsUpdate}
                        />
                    ))
                ) : (
                    <div className="cs-empty">
                        <span>💭</span>
                        <p>No comments yet — be the first!</p>
                    </div>
                )}
            </div>
        </section>
    );
}