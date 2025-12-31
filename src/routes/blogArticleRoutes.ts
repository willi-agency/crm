/* src/routes/blogArticleRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as BlogArticleController from '../controllers/blogArticleController';
import {
  createArticleSchema,
  updateArticleSchema,
} from '../schemas/blogArticleSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um autor
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('blog-articles', 'create'),
  validate(createArticleSchema),
  asyncHandler(BlogArticleController.createArticle)
);

// Rota para buscar todos os artigos
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('blog-articles', 'read'),
  asyncHandler(BlogArticleController.getAllArticles)
);

// Rota para buscar uma autor pelo slug
router.get(
  '/slug/:slug',
  authMiddleware,
  permissionMiddleware('blog-articles', 'read'),
  asyncHandler(BlogArticleController.getArticleBySlug)
);

router.get(
  '/id/:id',
  authMiddleware,
  permissionMiddleware('blog-articles', 'read'),
  asyncHandler(BlogArticleController.getArticleById)
);

router.get(
  '/create-data/:id',
  authMiddleware,
  permissionMiddleware('blog-articles', 'read'),
  asyncHandler(BlogArticleController.getArticleCreationDataById)
);

router.get(
  '/all/:apiKey',
  asyncHandler(BlogArticleController.getAllPublicArticlesByApiKey)
);

router.get(
  '/all/:apiKey/:slug',
  asyncHandler(BlogArticleController.getPublicArticleByApiKey)
);

// Rota para atualizar um article
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('blog-articles', 'update'),
  validate(updateArticleSchema),
  asyncHandler(BlogArticleController.updateArticle)
);

// Rota para deletar autor (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('blog-articles', 'delete'),
  asyncHandler(BlogArticleController.deleteArticle)
);

export default router;
