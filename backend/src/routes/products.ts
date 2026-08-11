import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// All product routes require authentication
router.use(authenticate);

// GET /api/products — list with search, pagination, and low-stock filter
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '10'))));
    const search = String(req.query.search || '');
    const lowStock = req.query.lowStock === 'true';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
      ];
    }

    // Filter for low-stock products
    if (lowStock) {
      where.current_stock = { lte: prisma.product.fields.minimum_stock ? undefined : 0 };
      // Use raw filter: current_stock <= minimum_stock
      // Prisma doesn't support field-to-field comparison directly, so we fetch and filter
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    // If lowStock filter, post-filter in JS
    let data = products;
    let finalTotal = total;
    if (lowStock) {
      const allProducts = await prisma.product.findMany({ where: search ? { OR: where.OR } : {} });
      const lowStockProducts = allProducts.filter(p => p.current_stock <= p.minimum_stock);
      finalTotal = lowStockProducts.length;
      data = lowStockProducts.slice(skip, skip + limit);
    }

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/:id — single product
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// POST /api/products — create product
router.post('/', authorizeRoles('ADMIN', 'WAREHOUSE'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location } = req.body;

    if (!name || !sku || unit_price === undefined) {
      res.status(400).json({ message: 'Name, SKU, and unit_price are required' });
      return;
    }

    // Check for duplicate SKU
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      res.status(409).json({ message: 'A product with this SKU already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category: category || null,
        unit_price: parseFloat(unit_price),
        current_stock: parseInt(current_stock) || 0,
        minimum_stock: parseInt(minimum_stock) || 0,
        warehouse_location: warehouse_location || null,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/products/:id — update product
router.put('/:id', authorizeRoles('ADMIN', 'WAREHOUSE'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const { name, sku, category, unit_price, minimum_stock, warehouse_location } = req.body;

    if (!name || !sku || unit_price === undefined) {
      res.status(400).json({ message: 'Name, SKU, and unit_price are required' });
      return;
    }

    // Check for duplicate SKU (excluding current product)
    if (sku !== existing.sku) {
      const duplicate = await prisma.product.findUnique({ where: { sku } });
      if (duplicate) {
        res.status(409).json({ message: 'A product with this SKU already exists' });
        return;
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        category: category || null,
        unit_price: parseFloat(unit_price),
        minimum_stock: minimum_stock !== undefined ? parseInt(minimum_stock) : existing.minimum_stock,
        warehouse_location: warehouse_location || null,
      },
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
export default router;
