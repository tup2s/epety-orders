import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload';

const getParamId = (param: string | string[]): number => {
  const id = Array.isArray(param) ? param[0] : param;
  return parseInt(id, 10);
};

const router = Router();

// Get all products (with optional category filter)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, search, inStock } = req.query;

    const where: any = {};

    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Get single product
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Create product (admin only)
router.post(
  '/',
  authenticate,
  isAdmin,
  upload.array('images', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, price, stock, categoryId } = req.body;

      if (!name || !price || !categoryId) {
        return res.status(400).json({ error: 'Nazwa, cena i kategoria są wymagane' });
      }

      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!category) {
        return res.status(400).json({ error: 'Podana kategoria nie istnieje' });
      }

      // Upload images
      const imageUrls: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const url = await uploadToCloudinary(file.path);
          imageUrls.push(url);
        }
      }

      const product = await prisma.product.create({
        data: {
          name,
          description: description || null,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          categoryId: parseInt(categoryId),
          images: imageUrls,
        },
        include: {
          category: { select: { id: true, name: true } },
        },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// Update product (admin only)
router.put(
  '/:id',
  authenticate,
  isAdmin,
  upload.array('images', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = getParamId(req.params.id);
      const { name, description, price, stock, categoryId, removeImages } = req.body;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return res.status(404).json({ error: 'Produkt nie znaleziony' });
      }

      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: parseInt(categoryId) },
        });

        if (!category) {
          return res.status(400).json({ error: 'Podana kategoria nie istnieje' });
        }
      }

      // Handle image removal
      let updatedImages = [...product.images];
      if (removeImages) {
        const imagesToRemove = JSON.parse(removeImages);
        for (const imageUrl of imagesToRemove) {
          await deleteFromCloudinary(imageUrl);
          updatedImages = updatedImages.filter((img) => img !== imageUrl);
        }
      }

      // Upload new images
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const url = await uploadToCloudinary(file.path);
          updatedImages.push(url);
        }
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name: name || product.name,
          description: description !== undefined ? description : product.description,
          price: price ? parseFloat(price) : product.price,
          stock: stock !== undefined ? parseInt(stock) : product.stock,
          categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
          images: updatedImages,
        },
        include: {
          category: { select: { id: true, name: true } },
        },
      });

      res.json(updatedProduct);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// Update stock only (admin only)
router.patch('/:id/stock', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Podaj prawidłową ilość' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock) },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    // Delete images from Cloudinary
    for (const imageUrl of product.images) {
      await deleteFromCloudinary(imageUrl);
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Produkt został usunięty' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
