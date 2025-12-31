/* src/routes/leadRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as LeadController from '../controllers/leadController';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('leads', 'create'),
  asyncHandler(LeadController.createInternalLead)
);

// Rota para buscar todos os leads
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('leads', 'read'),
  asyncHandler(LeadController.getAllLeads)
);

router.get(
  '/enterprise/:id',
  authMiddleware,
  permissionMiddleware('leads', 'read'),
  asyncHandler(LeadController.getAllLeadsByEnterpriseId)
);

router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('leads', 'read'),
  asyncHandler(LeadController.getLeadById)
);

router.get(
  '/enterprise/kanban/:enterpriseId/:pipelineId',
  authMiddleware,
  permissionMiddleware('leads', 'read'),
  asyncHandler(LeadController.getAllLeadsKanban)
);

export default router;
