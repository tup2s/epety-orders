import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';

const getParamId = (param: string | string[]): number => {
  const id = Array.isArray(param) ? param[0] : param;
  return parseInt(id, 10);
};

const router = Router();

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Get all customers
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        login: true,
        name: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Create customer
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { login, password, name } = req.body;

    if (!login || !password || !name) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Login jest już zajęty' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        name,
        role: 'CUSTOMER',
      },
      select: { id: true, login: true, name: true, createdAt: true },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Update customer
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    const { login, name } = req.body;

    const customer = await prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Klient nie znaleziony' });
    }

    if (login && login !== customer.login) {
      const existingUser = await prisma.user.findUnique({
        where: { login },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Login jest już zajęty' });
      }
    }

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: { login, name },
      select: { id: true, login: true, name: true, createdAt: true },
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Reset customer password
router.patch('/:id/password', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Podaj nowe hasło' });
    }

    const customer = await prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Klient nie znaleziony' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Hasło zostało zresetowane' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Delete customer
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    const customer = await prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Klient nie znaleziony' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'Klient został usunięty' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
