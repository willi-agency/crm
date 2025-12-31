/* src/routes/ecommerceCategoryRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as EcommerceCategoryController from '../controllers/ecommerceCategoryController';
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from '../schemas/ecommerceCategorySchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma categoria
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('ecommerce-categories', 'create'),
  validate(createCategorySchema),
  asyncHandler(EcommerceCategoryController.createCategory)
);

// Rota para buscar todas as categorias
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('ecommerce-categories', 'read'),
  asyncHandler(EcommerceCategoryController.getAllCategories)
);

// Rota para buscar uma categoria pelo Slug
router.get(
  '/slug/:slug',
  authMiddleware,
  permissionMiddleware('ecommerce-categories', 'read'),
  asyncHandler(EcommerceCategoryController.getCategoryBySlug)
);

// Rota para atualizar uma categoria
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('ecommerce-categories', 'update'),
  validate(updateCategorySchema),
  asyncHandler(EcommerceCategoryController.updateCategory)
);

// Rota para deletar categoria (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('ecommerce-categories', 'delete'),
  validate(deleteCategorySchema),
  asyncHandler(EcommerceCategoryController.deleteCategory)
);

export default router;
