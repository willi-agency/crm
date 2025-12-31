/* src/routes/blogTagRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as BlogTagController from '../controllers/blogTagController';
import {
  createTagSchema,
  deleteTagSchema,
  getTagBySlugSchema,
  updateTagSchema,
} from '../schemas/blogTagSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma tag
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('blog-tags', 'create'),
  validate(createTagSchema),
  asyncHandler(BlogTagController.createTag)
);

// Rota para buscar todas as tags
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('blog-tags', 'read'),
  asyncHandler(BlogTagController.getAllTags)
);

// Rota para buscar uma tag pelo Slug
router.get(
  '/slug/:slug',
  authMiddleware,
  permissionMiddleware('blog-tags', 'read'),
  asyncHandler(BlogTagController.getTagBySlug)
);

// Rota para atualizar uma tag
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('blog-tags', 'update'),
  validate(updateTagSchema),
  asyncHandler(BlogTagController.updateTag)
);

// Rota para deletar tag (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('blog-tags', 'delete'),
  asyncHandler(BlogTagController.deleteTag)
);

export default router;
