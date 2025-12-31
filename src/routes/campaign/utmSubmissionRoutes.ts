// src/routes/campaign/utmSubmissionRoutes.ts
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as UtmSubmissionController from '../../controllers/campaign/utmSubmissionController';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Criar uma URL com UTMs
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('enterprises', 'create'),
  asyncHandler(UtmSubmissionController.createUtmSubmission)
);

router.post(
  '/similarity',
  authMiddleware,
  permissionMiddleware('enterprises', 'create'),
  asyncHandler(UtmSubmissionController.checkUtmSimilarity)
);

// Buscar todas as URLs com UTMs
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(UtmSubmissionController.getAllUtmSubmissions)
);

// Buscar uma URL com UTMs pelo ID
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(UtmSubmissionController.getUtmSubmissionById)
);

export default router;
