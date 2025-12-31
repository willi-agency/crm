/* src/routes/leadRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as LeadPipelineController from '../../controllers/lead/leadPipelineController';
import { createLeadPipelineListController } from '../../controllers/lead/leadPipelineListController';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma pipeline
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'create'),
  asyncHandler(LeadPipelineController.createLeadPipelineController)
);

// Rota para criar uma movimentação de stage do lead
router.post(
  '/move',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'create'),
  asyncHandler(createLeadPipelineListController)
);

// Rota para buscar todos as-pipelines
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'read'),
  asyncHandler(LeadPipelineController.getAllLeadPipelines)
);

router.get(
  '/enterprise/:id',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'read'),
  asyncHandler(LeadPipelineController.getAllLeadPipelinesById)
);

router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('lead-pipelines', 'update'),
  asyncHandler(LeadPipelineController.updateLeadPipeline)
);

export default router;
