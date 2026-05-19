import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://tegron-learnify.onrender.com';

export const SocketProvider = ({ children }) => {
    const { user, updateBalance } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        // Only connect when a user is logged in
        if (!user?._id) {
            // Clean up any existing socket when user logs out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Avoid duplicate connections (e.g. React StrictMode double-mount)
        if (socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
            // Join the private room for this user so the server can target us
            socket.emit('joinUserRoom', user._id);

            // If the user is an admin, also join the admin room
            if (user.role === 'admin') {
                socket.emit('joinAdminRoom');
            }
        });

        // ── Live balance update ───────────────────────────────────────────────────
        // Fires whenever the server deducts balance after a purchase.
        // We update AuthContext directly so Navbar and UserProfile re-render instantly.
        socket.on('balanceUpdated', ({ newBalance, reason, bookTitle, booksCount, amount }) => {
            updateBalance(newBalance);

            // Show a subtle confirmation toast
            if (reason === 'purchase') {
                const label = bookTitle ? `"${bookTitle}"` : `${booksCount} book${booksCount > 1 ? 's' : ''}`;
                toast.success(`✅ Purchased ${label} · ₹${Number(amount).toFixed(2)} deducted`, {
                    duration: 4000,
                });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
        // Re-run only when the user's id changes (login / logout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    return (
        <SocketContext.Provider value={socketRef}>
            {children}
        </SocketContext.Provider>
    );
};

// Optional hook — use if any component ever needs the raw socket instance
export const useSocket = () => useContext(SocketContext);
