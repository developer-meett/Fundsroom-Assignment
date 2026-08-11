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


export default router;