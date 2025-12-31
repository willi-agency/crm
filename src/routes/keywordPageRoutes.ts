/* src/routes/KeywordPageRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as KeywordPageController from '../controllers/keywordPageController';
import {
  createKeywordPageSchema,
  deleteKeywordPageSchema,
  updateKeywordPageSchema,
} from '../schemas/KeywordPageSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma categoria
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('keyword-pages', 'create'),
  validate(createKeywordPageSchema),
  asyncHandler(KeywordPageController.createKeywordPage)
);

// Rota para buscar todas as categorias
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('keyword-pages', 'read'),
  asyncHandler(KeywordPageController.getAllKeywordPages)
);

// Rota para buscar uma categoria pelo Slug
router.get(
  '/slug/:slug',
  authMiddleware,
  permissionMiddleware('keyword-pages', 'read'),
  asyncHandler(KeywordPageController.getKeywordPageBySlug)
);

router.get(
  '/id/:id',
  authMiddleware,
  permissionMiddleware('keyword-pages', 'read'),
  asyncHandler(KeywordPageController.getKeywordPageById)
);

router.get(
  '/enterprise/:id',
  authMiddleware,
  permissionMiddleware('keyword-pages', 'read'),
  asyncHandler(KeywordPageController.getKeywordPageByEnterpriseId)
);

router.get(
  '/all/:apiKey',
  asyncHandler(KeywordPageController.getAllPublicKeywordPagesByApiKey)
);

router.get(
  '/all/:apiKey/:slug',
  asyncHandler(KeywordPageController.getPublicKeywordPageByApiKey)
);

// Rota para atualizar uma Keyword
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('keyword-pages', 'update'),
  validate(updateKeywordPageSchema),
  asyncHandler(KeywordPageController.updateKeywordPages)
);

// Rota para deletar Keyword (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('keyword-pages', 'delete'),
  asyncHandler(KeywordPageController.deleteKeywordPage)
);

export default router;
