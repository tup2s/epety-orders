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

// Update admin
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, login, password } = req.body;

    const admin = await prisma.user.findUnique({
      where: { id, role: 'ADMIN' },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Administrator nie znaleziony' });
    }

    // Check if login is taken by another user
    if (login && login !== admin.login) {
      const existingUser = await prisma.user.findUnique({
        where: { login },
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Login jest już zajęty' });
      }
    }

    const updateData: { name?: string; login?: string; password?: string } = {};
    if (name) updateData.name = name;
    if (login) updateData.login = login;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Hasło musi mieć minimum 6 znaków' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, login: true, name: true, createdAt: true },
    });

    res.json(updatedAdmin);
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Delete admin
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = parseInt(req.params.id as string);

    // Prevent deleting yourself
    if (req.user?.id === adminId) {
      return res.status(400).json({ error: 'Nie możesz usunąć samego siebie' });
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: 'ADMIN' },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Administrator nie znaleziony' });
    }

    // Check if this is the last admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Nie można usunąć ostatniego administratora' });
    }

    await prisma.user.delete({
      where: { id: adminId },
    });

    res.json({ message: 'Administrator usunięty' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
