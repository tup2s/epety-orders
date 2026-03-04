import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Create admin
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { login, password, name } = req.body;

    if (!login || !password || !name) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Hasło musi mieć minimum 6 znaków' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Login jest już zajęty' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
      select: { id: true, login: true, name: true, role: true, createdAt: true },
    });

    res.status(201).json(admin);
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Get all admins
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        login: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
