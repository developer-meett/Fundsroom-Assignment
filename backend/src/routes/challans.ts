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


export default router;