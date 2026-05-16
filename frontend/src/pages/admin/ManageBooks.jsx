import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import ConfirmModal from '../../components/ConfirmModal';
import { getAllBooks, deleteBook } from '../../services/api';
import toast from 'react-hot-toast';
import { getFileUrl } from '../../services/api';

export default function ManageBooks() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDel] = useState(null);
    const [search, setSearch] = useState('');
    const [toDelete, setToDelete] = useState(null); // { id, title }

    const load = () => {
        setLoading(true);
        getAllBooks()
            .then(({ data }) => setBooks(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const confirmDelete = (id, title) => setToDelete({ id, title });

    const handleDelete = async () => {
        if (!toDelete) return;
        setDel(toDelete.id);
        setToDelete(null);
        try {
            await deleteBook(toDelete.id);
            toast.success('Book deleted');
            setBooks(prev => prev.filter(b => b._id !== toDelete.id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        } finally {
            setDel(null);
        }
    };

    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <button className="back-btn" onClick={() => navigate('/admin')}>
                ← Back to Dashboard
            </button>

            <div className="admin-page-header">
                <div className="admin-page-title">📚 Manage Books</div>
                <div className="admin-page-subtitle">{books.length} books in the store</div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    style={{
                        flex: 1, minWidth: 200, padding: '10px 18px',
                        border: '2px solid var(--border-gray)', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem', background: 'var(--light-gray)',
                        fontFamily: 'Poppins, sans-serif',
                    }}
                    placeholder="Search books by title…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => navigate('/admin/add-book')}>
                    ➕ Add New Book
                </button>
            </div>

            {loading ? <Loader /> : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Cover</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Content</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                                        No books found
                                    </td>
                                </tr>
                            ) : filtered.map(book => (
                                <tr key={book._id}>
                                    <td>
                                        {book.thumbnail ? (
                                            <img src={getFileUrl(book.thumbnail)} alt={book.title}
                                                style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 6 }} />
                                        ) : (
                                            <div style={{
                                                width: 44, height: 56, background: 'var(--navy)', borderRadius: 6,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem',
                                            }}>📖</div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.88rem' }}>{book.title}</div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--orange-red)' }}>
                                        {book.price === 0 ? 'FREE' : `₹${book.price.toFixed(2)}`}
                                    </td>
                                    <td>
                                        {book.pdfFile ? (
                                            <span className="badge badge-success">📄 PDF</span>
                                        ) : book.bookUrl ? (
                                            <span className="badge badge-warning">🔗 URL</span>
                                        ) : (
                                            <span className="badge badge-danger">None</span>
                                        )}
                                    </td>
                                    <td>
                                        {/* ✅ CHANGED: Three action buttons - Open Book, Edit, Delete */}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button
                                                className="btn btn-sm"
                                                style={{
                                                    background: 'var(--cyan)', color: '#fff',
                                                    border: 'none', cursor: 'pointer',
                                                }}
                                                onClick={() => navigate(`/admin/book/${book._id}`)}
                                            >
                                                📖 Open
                                            </button>
                                            <button className="btn btn-outline btn-sm"
                                                onClick={() => navigate(`/admin/edit-book/${book._id}`)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="btn btn-danger btn-sm"
                                                onClick={() => confirmDelete(book._id, book.title)}
                                                disabled={deleting === book._id}>
                                                {deleting === book._id ? '…' : '🗑️'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {toDelete && (
                <ConfirmModal
                    icon="🗑️"
                    title="Delete Book?"
                    message={`Are you sure you want to delete "${toDelete.title}"? This cannot be undone.`}
                    confirmText="Yes, Delete"
                    cancelText="Cancel"
                    danger={true}
                    onConfirm={handleDelete}
                    onCancel={() => setToDelete(null)}
                />
            )}
        </AdminLayout>
    );
}