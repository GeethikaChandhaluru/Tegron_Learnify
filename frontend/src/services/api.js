import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
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

// ── PROFILE ───────────────────────────────────────────────────────────────────

// Pass a FormData object; can contain 'username' and/or 'profilePic' (file)
export const updateProfile = (payload) => API.put("/auth/profile", payload);

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
export const addToCart = (bookId) => API.post('/cart', { bookId });
export const removeFromCart = (bookId) => API.delete(`/cart/${bookId}`);
export const clearCart = () => API.delete('/cart');

// ── ORDERS ───────────────────────────────────────────────────────────────────

export const buyNow = (bookId) => API.post(`/orders/buy-now/${bookId}`);
export const checkoutCart = () => API.post('/orders/checkout');
export const getMyOrders = () => API.get('/orders');
export const getPurchasedBooks = () => API.get('/orders/purchased');
export const getWalletBalance = () => API.get('/orders/wallet');

// ── FILE URL HELPER ───────────────────────────────────────────────────────────

export const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `https://tegron-learnify.onrender.com/${filePath.replace(/^\/+/, '')}`;
};

// ── ADMIN ────────────────────────────────────────────────────────────────────

export const getAdminStats = () => API.get('/admin/stats');
export const getAdminPayments = () => API.get('/admin/payments');
export const getAdminUsers = () => API.get('/admin/users');
export const getAllUsers = () => API.get('/admin/users');       // alias
export const getAdminOrders = () => API.get('/admin/orders');
export const getAllOrders = () => API.get('/admin/orders');     // alias