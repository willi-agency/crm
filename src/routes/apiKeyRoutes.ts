/* src/routes/apiKeyRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as BlogApiKeyController from '../controllers/apiKeyController';
import { createApiKeySchema } from '../schemas/apiKeySchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um autor
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('api-key', 'create'),
  asyncHandler(BlogApiKeyController.createApiKey)
);

// Rota para buscar todos os autores
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('api-key', 'read'),
  asyncHandler(BlogApiKeyController.getAllApiKeys)
);

// Rota para buscar uma autor pelo slug
router.get(
  '/key/:key',
  authMiddleware,
  permissionMiddleware('api-key', 'read'),
  asyncHandler(BlogApiKeyController.getApiKeyByKey)
);

// Rota para deletar autor (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('api-key', 'delete'),
  asyncHandler(BlogApiKeyController.deleteApiKey)
);

export default router;
