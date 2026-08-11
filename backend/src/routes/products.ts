import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// All product routes require authentication
router.use(authenticate);


export default router;
