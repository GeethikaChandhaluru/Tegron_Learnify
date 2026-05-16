import axios from 'axios';

const API = axios.create({
    baseURL: 'https://tegron-learnify.onrender.com/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('tn_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    return config;
});

// ── AUTH ─────────────────────────────────────────────────────────────────────

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => API.put(`/auth/reset-password/${token}`, data);

// ── BOOKS ────────────────────────────────────────────────────────────────────

export const getAllBooks = () => API.get('/books');
export const getBook = (id) => API.get(`/books/${id}`);
export const addBook = (formData) => API.post('/books', formData);
export const updateBook = (id, fd) => API.put(`/books/${id}`, fd);
export const deleteBook = (id) => API.delete(`/books/${id}`);

// ── BOOK LIKE ─────────────────────────────────────────────────────────────────

export const likeBook = (id) => API.post(`/books/${id}/like`);

// ── COMMENTS ─────────────────────────────────────────────────────────────────

export const addComment = (bookId, text) => API.post(`/books/${bookId}/comment`, { text });
export const deleteComment = (bookId, commentId) => API.delete(`/books/${bookId}/comment/${commentId}`);

// ── COMMENT LIKE ─────────────────────────────────────────────────────────────

export const likeComment = (bookId, commentId) =>
    API.post(`/books/${bookId}/comment/${commentId}/like`);

// ── REPLIES ───────────────────────────────────────────────────────────────────
// parentReplyId: null/omitted = direct reply to comment
//               <id string>  = nested reply (reply to another reply)

export const addReply = (bookId, commentId, text, parentReplyId = null) =>
    API.post(`/books/${bookId}/comment/${commentId}/reply`, {
        text,
        ...(parentReplyId ? { parentReplyId } : {}),
    });

export const deleteReply = (bookId, commentId, replyId) =>
    API.delete(`/books/${bookId}/comment/${commentId}/reply/${replyId}`);

// ── REPLY LIKE ────────────────────────────────────────────────────────────────

export const likeReply = (bookId, commentId, replyId) =>
    API.post(`/books/${bookId}/comment/${commentId}/reply/${replyId}/like`);

// ── CART ─────────────────────────────────────────────────────────────────────

export const getCart = () => API.get('/cart');
export const addToCart = (id) => API.post(`/cart/${id}`);
export const removeFromCart = (id) => API.delete(`/cart/${id}`);
export const clearCart = () => API.delete('/cart');

// ── ORDERS ────────────────────────────────────────────────────────────────────

export const buyNow = (id) => API.post(`/orders/buy-now/${id}`);
export const checkoutCart = () => API.post('/orders/checkout');
export const getMyOrders = () => API.get('/orders');
export const getPurchasedBooks = () => API.get('/orders/purchased');

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const getAdminOrders = () => API.get('/admin/orders');
export const getAdminPurchased = () => API.get('/admin/purchased');
export const getAdminPayments = () => API.get('/admin/payments');

// ── FILE URL ──────────────────────────────────────────────────────────────────

export const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `https://tegron-learnify.onrender.com/${filePath.replace(/^\/+/, '')}`;
};