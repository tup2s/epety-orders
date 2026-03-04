import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import adminRoutes from './routes/admins';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to load
}));

// Rate limiting - general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Zbyt wiele żądań, spróbuj ponownie później' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - login (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 min
  message: { error: 'Zbyt wiele prób logowania, spróbuj ponownie za 15 minut' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(generalLimiter);
app.use('/uploads', express.static('uploads'));

// Apply stricter rate limit to login
app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/admins', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
