/* src/routes/leadPublicRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as LeadController from '../controllers/leadController';
import { createLeadSchema } from '../schemas/leadSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um lead
router.post(
  '/create',
  validate(createLeadSchema),
  asyncHandler(LeadController.createLead)
);

export default router;
