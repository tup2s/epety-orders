import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';

const getParamId = (param: string | string[]): number => {
  const id = Array.isArray(param) ? param[0] : param;
  return parseInt(id, 10);
};

const router = Router();

// Get all categories (public for logged-in users)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Create category (admin only)
router.post('/', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nazwa kategorii jest wymagana' });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Kategoria o tej nazwie już istnieje' });
    }

    const category = await prisma.category.create({
      data: { name, description },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Update category (admin only)
router.put('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    const { name, description } = req.body;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }

    if (name && name !== category.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name },
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'Kategoria o tej nazwie już istnieje' });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, description },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return res.status(404).json({ error: 'Kategoria nie znaleziona' });
    }

    if (category._count.products > 0) {
      return res.status(400).json({ 
        error: 'Nie można usunąć kategorii zawierającej produkty' 
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: 'Kategoria została usunięta' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
