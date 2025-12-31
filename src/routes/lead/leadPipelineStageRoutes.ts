/* src/routes/leadRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as LeadPipelineController from '../../controllers/lead/leadPipelineStageController';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma pipeline
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'create'),
  asyncHandler(LeadPipelineController.createLeadPipelineStageController)
);

router.get(
  '/:pipelineId',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'read'),
  asyncHandler(LeadPipelineController.getAllLeadPipelineStagesByPipelineId)
);

router.patch(
  '/update/:pipelineId',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'update'),
  asyncHandler(LeadPipelineController.updateLeadPipelineStage)
);

export default router;
