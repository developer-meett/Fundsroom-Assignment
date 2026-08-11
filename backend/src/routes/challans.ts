import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Utility to generate challan number
async function generateChallanNumber(): Promise<string> {
  const lastChallan = await prisma.challan.findFirst({
    orderBy: { id: 'desc' },
  });
  
  if (!lastChallan) {
    return 'CH-0001';
  }
  
  // Extract number from "CH-0042"
  const parts = lastChallan.challan_number.split('-');
  let num = 1;
  if (parts.length === 2) {
    num = parseInt(parts[1], 10) + 1;
  }
  
  return `CH-${num.toString().padStart(4, '0')}`;
}

// GET /api/challans — list challans
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '10'))));
    const skip = (page - 1) * limit;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } }
        }
      }),
      prisma.challan.count()
    ]);

    res.json({
      data: challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/challans/:id — single challan with items
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid challan ID' });
      return;
    }

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, business_name: true, address: true, mobile: true } },
        user: { select: { id: true, name: true } },
        items: true
      }
    });

    if (!challan) {
      res.status(404).json({ message: 'Challan not found' });
      return;
    }

    res.json(challan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/challans — create DRAFT challan
router.post('/', authorizeRoles('ADMIN', 'SALES'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customer_id, items } = req.body;
    
    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'customer_id and a non-empty items array are required' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id: parseInt(customer_id) } });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    let totalQuantity = 0;
    const challanItemsData = [];

    // Verify all products and prepare snapshot data
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: parseInt(item.product_id) } });
      if (!product) {
        res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
        return;
      }
      
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ message: `Invalid quantity for product ${product.name}` });
        return;
      }

      totalQuantity += qty;
      
      // Store snapshot of product data at time of challan creation
      challanItemsData.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: product.unit_price,
        quantity: qty
      });
    }

    // Creating DRAFT does not affect stock, just creates the records
    const challanNumber = await generateChallanNumber();

    const challan = await prisma.challan.create({
      data: {
        challan_number: challanNumber,
        customer_id: customer.id,
        status: 'DRAFT',
        total_quantity: totalQuantity,
        created_by: req.user!.id,
        items: {
          create: challanItemsData
        }
      },
      include: { items: true }
    });

    res.status(201).json(challan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/challans/:id/confirm — confirm challan and deduct stock
router.post('/:id/confirm', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid challan ID' });
      return;
    }

    // Execute critical business logic inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch challan with items
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!challan) {
        throw new Error('CHALLAN_NOT_FOUND');
      }

      // 2. Check if currently DRAFT
      if (challan.status === 'CONFIRMED') {
        throw new Error('ALREADY_CONFIRMED');
      }
      if (challan.status === 'CANCELLED') {
        throw new Error('IS_CANCELLED');
      }
      if (challan.status !== 'DRAFT') {
        throw new Error('NOT_DRAFT');
      }


export default router;