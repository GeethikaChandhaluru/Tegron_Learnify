const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Correct paths
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorMiddleware');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

dotenv.config();

// Connect DB
connectDB();

const app = express();

// ── Socket.io Setup ───────────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://tegronlearnify.vercel.app"
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join user's private room ──────────────────────────────────────────────
    // The client emits 'joinUserRoom' with their userId right after connecting.
    // This puts the socket into room "user:<userId>" so the server can target
    // balance-update events at that specific user without broadcasting to everyone.
    socket.on('joinUserRoom', (userId) => {
        if (userId) {
            socket.join(`user:${userId}`);
            console.log(`👤 Socket ${socket.id} joined room user:${userId}`);
        }
    });

    // ── Join admin room ───────────────────────────────────────────────────────
    socket.on('joinAdminRoom', () => {
        socket.join('room:admin');
        console.log(`🛡️  Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
    });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://tegronlearnify.vercel.app"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (thumbnails, pdfs, profile pics)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Tegron Notes API is running 📚' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ⚠️  Use `server.listen` (not `app.listen`) so socket.io works
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});