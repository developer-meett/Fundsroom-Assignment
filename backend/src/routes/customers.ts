import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// GET /api/customers — list with search + pagination
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '10'))));
    const search = String(req.query.search || '');
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { mobile: { contains: search } },
            { business_name: { contains: search } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/customers/:id — single customer
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid customer ID' });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        follow_ups: {
          orderBy: { created_at: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/customers — create
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, mobile, email, business_name, gst_number, customer_type, address, status, notes } = req.body;

    if (!name || !mobile) {
      res.status(400).json({ message: 'Name and mobile are required' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email: email || null,
        business_name: business_name || null,
        gst_number: gst_number || null,
        customer_type: customer_type || null,
        address: address || null,
        status: status || 'ACTIVE',
        notes: notes || null,
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/customers/:id — update
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid customer ID' });
      return;
    }

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

    if (!name || !mobile) {
      res.status(400).json({ message: 'Name and mobile are required' });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        mobile,
        email: email || null,
        business_name: business_name || null,
        gst_number: gst_number || null,
        customer_type: customer_type || null,
        address: address || null,
        status: status || existing.status,
        follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
        notes: notes || null,
      },
    });

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/customers/:id — delete
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid customer ID' });
      return;
    }

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    await prisma.customer.delete({ where: { id } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/customers/:id/followups — add a follow-up note
router.post('/:id/followups', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = parseInt(String(req.params.id));
    if (isNaN(customerId)) {
      res.status(400).json({ message: 'Invalid customer ID' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const { note, follow_up_date } = req.body;

    if (!note) {
      res.status(400).json({ message: 'Note is required' });
      return;
    }

    const followUp = await prisma.followUp.create({
      data: {
        customer_id: customerId,
        note,
        follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
        created_by: req.user!.id,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    // Also update the customer's follow_up_date if provided
    if (follow_up_date) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { follow_up_date: new Date(follow_up_date) },
      });
    }

    res.status(201).json(followUp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
