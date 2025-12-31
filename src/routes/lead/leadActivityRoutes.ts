/* src/routes/leadActivityRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as LeadActivityController from '../../controllers/lead/leadActivityController';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma Activity
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('lead-activitys', 'create'),
  asyncHandler(LeadActivityController.createLeadActivity)
);

// Rota para buscar todos as-Activitys
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('lead-activitys', 'read'),
  asyncHandler(LeadActivityController.getAllLeadActivities)
);

router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('lead-activitys', 'read'),
  asyncHandler(LeadActivityController.getLeadActivityById)
);

router.get(
  '/lead/:leadId',
  authMiddleware,
  permissionMiddleware('lead-activitys', 'read'),
  asyncHandler(LeadActivityController.getLeadActivitiesByLeadId)
);

router.get(
  '/pending/:enterpriseId',
  authMiddleware,
  permissionMiddleware('lead-activitys', 'read'),
  asyncHandler(LeadActivityController.getLeadPendingActivitiesByEnterpriseId)
);

router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('lead-activitys', 'update'),
  asyncHandler(LeadActivityController.updateLeadActivity)
);

export default router;
