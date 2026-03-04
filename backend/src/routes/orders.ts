import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';

const getParamId = (param: string | string[]): number => {
  const id = Array.isArray(param) ? param[0] : param;
  return parseInt(id, 10);
};

const router = Router();

// Get orders - admin sees all, customer sees own
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};

    // Customers can only see their own orders
    if (req.user!.role !== 'ADMIN') {
      where.userId = req.user!.id;
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, login: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Get single order
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, login: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, price: true } },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }

    // Customers can only view their own orders
    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Brak dostępu do tego zamówienia' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Create order (customer)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Zamówienie musi zawierać przynajmniej jeden produkt' });
    }

    // Validate products and calculate total
    let totalPrice = 0;
    const orderItems: { productId: number; quantity: number; priceAtOrder: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(400).json({ error: `Produkt o ID ${item.productId} nie istnieje` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Niewystarczająca ilość produktu "${product.name}" (dostępne: ${product.stock})`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtOrder: product.price,
      });
    }

    // Create order and update stock in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          totalPrice,
          notes: notes || null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } },
            },
          },
        },
      });

      // Update stock for each product
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    const { status } = req.body;

    const validStatuses = ['NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Nieprawidłowy status zamówienia' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }

    // If cancelling, restore stock and delete order
    if (status === 'CANCELLED') {
      if (order.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Zamówienie już jest anulowane' });
      }

      await prisma.$transaction(async (tx) => {
        // Restore stock for each product
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }

        // Delete order items first (due to foreign key)
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Delete the order
        await tx.order.delete({
          where: { id },
        });
      });

      return res.json({ message: 'Zamówienie zostało anulowane i usunięte', deleted: true });
    } else {
      await prisma.order.update({
        where: { id },
        data: { status },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, login: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Get dashboard stats (admin only)
router.get('/admin/stats', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [
      newOrdersCount,
      totalOrders,
      lowStockProducts,
      totalCustomers,
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'NEW' } }),
      prisma.order.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    res.json({
      newOrdersCount,
      totalOrders,
      lowStockProducts,
      totalCustomers,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;
