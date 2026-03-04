import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import prisma from './utils/prisma';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint - REMOVE IN PRODUCTION
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ 
      select: { id: true, login: true, role: true, name: true } 
    });
    res.json({ userCount: users.length, users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Debug login test - REMOVE IN PRODUCTION
app.post('/api/debug/test-login', async (req, res) => {
  const bcrypt = await import('bcryptjs');
  try {
    const user = await prisma.user.findUnique({ where: { login: 'admin' } });
    if (!user) {
      return res.json({ error: 'No admin user found' });
    }
    
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    res.json({
      adminExists: true,
      passwordHash: user.password.substring(0, 20) + '...',
      hashLength: user.password.length,
      testPasswordValid: isValid,
      bcryptVersion: bcrypt.default ? 'esm' : 'cjs'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
