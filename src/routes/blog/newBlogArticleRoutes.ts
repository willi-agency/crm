/* src/routes/blogArticleRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as BlogArticleController from '../../controllers/blog/blogArticleController';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um autor
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('blog-articles', 'create'),
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
  '/home/:apiKey',
  asyncHandler(BlogArticleController.getPublicBlogHomeByApiKey)
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
