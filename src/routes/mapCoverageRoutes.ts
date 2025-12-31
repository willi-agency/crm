// src/routes/mapCoverageRoutes.ts
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as MapCoverageController from '../controllers/mapCoverageController';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

const permission = permissionMiddleware('enterprises', 'update');

// Lista todos os países
router.get(
  '/countries',
  authMiddleware,
  permission,
  asyncHandler(MapCoverageController.getAllCountries)
);

// Lista os estados por país
router.get(
  '/states/:id',
  authMiddleware,
  permission,
  asyncHandler(MapCoverageController.getStatesByCountryId)
);

// Lista as cidades por estado
router.get(
  '/cities/:id',
  authMiddleware,
  permission,
  asyncHandler(MapCoverageController.getCitiesByStateId)
);

// Lista os bairros por cidade
router.get(
  '/districts/:id',
  authMiddleware,
  permission,
  asyncHandler(MapCoverageController.getDistrictsByCityId)
);

export default router;
