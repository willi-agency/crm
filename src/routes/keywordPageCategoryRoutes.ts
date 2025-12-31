/* src/routes/keywordPageCategoryRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as KeywordPageCategoryController from '../controllers/keywordPageCategoryController';
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from '../schemas/keywordPageCategorySchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma categoria
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('keyword-pages-categories', 'create'),
  validate(createCategorySchema),
  asyncHandler(KeywordPageCategoryController.createCategory)
);

// Rota para buscar todas as categorias
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('keyword-pages-categories', 'read'),
  asyncHandler(KeywordPageCategoryController.getAllCategories)
);

// Rota para buscar uma categoria pelo Slug
router.get(
  '/slug/:slug',
  authMiddleware,
  permissionMiddleware('keyword-pages-categories', 'read'),
  asyncHandler(KeywordPageCategoryController.getCategoryBySlug)
);

// Rota para atualizar uma categoria
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('keyword-pages-categories', 'update'),
  validate(updateCategorySchema),
  asyncHandler(KeywordPageCategoryController.updateCategory)
);

// Rota para deletar categoria (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('keyword-pages-categories', 'delete'),
  validate(deleteCategorySchema),
  asyncHandler(KeywordPageCategoryController.deleteCategory)
);

export default router;
