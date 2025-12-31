/* src/routes/blogCategoryRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as BlogCategoryController from '../controllers/blogCategoryController';
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from '../schemas/blogCategorySchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma categoria
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('blog-categories', 'create'),
  validate(createCategorySchema),
  asyncHandler(BlogCategoryController.createCategory)
);

// Rota para buscar todas as categorias
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('blog-categories', 'read'),
  asyncHandler(BlogCategoryController.getAllCategories)
);

// Rota para buscar uma categoria pelo Slug
router.get(
  '/slug/:slug',
  authMiddleware,
  permissionMiddleware('blog-categories', 'read'),
  asyncHandler(BlogCategoryController.getCategoryBySlug)
);

// Rota para atualizar uma categoria
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('blog-categories', 'update'),
  validate(updateCategorySchema),
  asyncHandler(BlogCategoryController.updateCategory)
);

// Rota para deletar categoria (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('blog-categories', 'delete'),
  validate(deleteCategorySchema),
  asyncHandler(BlogCategoryController.deleteCategory)
);

export default router;
