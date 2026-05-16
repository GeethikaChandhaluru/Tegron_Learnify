import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import { addBook, updateBook, getBook } from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', price: '', bookUrl: '' };

export default function AddBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [thumbnail, setThumb] = useState(null);
    const [pdfFile, setPdf] = useState(null);
    const [pdfMode, setPdfMode] = useState('upload'); // 'upload' | 'url'
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSub] = useState(false);
    const thumbRef = useRef();
    const pdfRef = useRef();

    useEffect(() => {
        if (!isEdit) return;
        getBook(id)
            .then(({ data }) => {
                const b = data.data;
                setForm({ title: b.title, description: b.description, price: b.price, bookUrl: b.bookUrl || '' });
                if (b.bookUrl && !b.pdfFile) setPdfMode('url');
            })
            .catch(() => { toast.error('Book not found'); navigate('/admin/manage-books'); })
            .finally(() => setLoading(false));
    }, [id, isEdit, navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate: must have either PDF file or URL
        if (pdfMode === 'upload' && !pdfFile && !isEdit) {
            toast.error('Please upload a PDF file or switch to URL mode'); return;
        }
        if (pdfMode === 'url' && !form.bookUrl) {
            toast.error('Please enter a book URL'); return;
        }

        setSub(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('description', form.description);
            fd.append('price', form.price);
            // Send empty author/category since backend still expects them (we made them optional)
            fd.append('author', '-');
            fd.append('category', 'General');
            if (pdfMode === 'url') {
                fd.append('bookUrl', form.bookUrl);
            } else {
                fd.append('bookUrl', '');
            }
            if (thumbnail) fd.append('thumbnail', thumbnail);
            if (pdfMode === 'upload' && pdfFile) fd.append('pdfFile', pdfFile);

            if (isEdit) {
                await updateBook(id, fd);
                toast.success('Book updated successfully!');
            } else {
                await addBook(fd);
                toast.success('Book added successfully!');
                setForm(emptyForm); setThumb(null); setPdf(null);
            }
            navigate('/admin/manage-books');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save book');
        } finally {
            setSub(false);
        }
    };

    if (loading) return <AdminLayout><Loader /></AdminLayout>;

    return (
        <AdminLayout>
            <button className="back-btn" onClick={() => navigate('/admin')}>
                ← Back to Dashboard
            </button>

            <div className="admin-page-header">
                <div className="admin-page-title">{isEdit ? '✏️ Edit Book' : '➕ Add New Book'}</div>
                <div className="admin-page-subtitle">
                    {isEdit ? 'Update book details below.' : 'Fill in the details to add a new book.'}
                </div>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group">
                        <label>Book Title *</label>
                        <input name="title" value={form.title} onChange={handleChange}
                            required placeholder="" />
                    </div>

                    {/* Price */}
                    <div className="form-group">
                        <label>Price (₹) *</label>
                        <input name="price" type="number" min="0" step="0.01"
                            value={form.price} onChange={handleChange} required placeholder="" />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Description *</label>
                        <textarea name="description" value={form.description}
                            onChange={handleChange} required placeholder="" />
                    </div>

                    {/* Thumbnail */}
                    <div className="form-group">
                        <label>Thumbnail Image (optional)</label>
                        <div className="file-upload-box" onClick={() => thumbRef.current.click()}>
                            <input ref={thumbRef} type="file" accept="image/*"
                                onChange={(e) => setThumb(e.target.files[0])} />
                            <div className="upload-icon">🖼️</div>
                            {thumbnail
                                ? <p className="selected">✅ {thumbnail.name}</p>
                                : <p>Click to upload cover image<br /><small>PNG, JPG, WEBP</small></p>}
                        </div>
                    </div>

                    {/* PDF or URL toggle */}
                    <div className="form-group">
                        <label>Book Content *</label>
                        <div className="pdf-toggle">
                            <button type="button"
                                className={`pdf-toggle-btn ${pdfMode === 'upload' ? 'active' : ''}`}
                                onClick={() => setPdfMode('upload')}>
                                📄 Upload PDF
                            </button>
                            <button type="button"
                                className={`pdf-toggle-btn ${pdfMode === 'url' ? 'active' : ''}`}
                                onClick={() => setPdfMode('url')}>
                                🔗 Enter URL
                            </button>
                        </div>

                        {pdfMode === 'upload' ? (
                            <div className="file-upload-box" onClick={() => pdfRef.current.click()}>
                                <input ref={pdfRef} type="file" accept="application/pdf"
                                    onChange={(e) => setPdf(e.target.files[0])} />
                                <div className="upload-icon">📄</div>
                                {pdfFile
                                    ? <p className="selected">✅ {pdfFile.name}</p>
                                    : <p>Click to upload PDF file<br /><small>PDF files only</small></p>}
                            </div>
                        ) : (
                            <input
                                name="bookUrl" value={form.bookUrl} onChange={handleChange}
                                type="url" placeholder="https://drive.google.com/... or any document URL"
                            />
                        )}
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                            Upload a PDF file <strong>or</strong> enter an external URL (Google Drive, Razorpay, etc.)
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving…' : isEdit ? '💾 Update Book' : '➕ Add Book'}
                        </button>
                        <button type="button" className="btn btn-outline"
                            onClick={() => navigate('/admin/manage-books')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
