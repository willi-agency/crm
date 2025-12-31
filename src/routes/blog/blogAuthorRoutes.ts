/* src/routes/blogAuthorRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as BlogAuthorController from '../../controllers/blog/blogAuthorController';
import {
  createAuthorSchema,
  updateAuthorSchema,
} from '../../schemas/blog/blogAuthorSchemas';
import validate from '../../middlewares/validate';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um autor
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('blog-authors', 'create'),
  validate(createAuthorSchema),
  asyncHandler(BlogAuthorController.createAuthor)
);

// Rota para buscar todos os autores
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('blog-authors', 'read'),
  asyncHandler(BlogAuthorController.getAllAuthors)
);

// Rota para buscar uma autor pelo nome
router.get(
  '/name/:name',
  authMiddleware,
  permissionMiddleware('blog-authors', 'read'),
  asyncHandler(BlogAuthorController.getAuthorByName)
);

// Rota para atualizar um author
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('blog-authors', 'update'),
  validate(updateAuthorSchema),
  asyncHandler(BlogAuthorController.updateAuthor)
);

// Rota para deletar autor (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('blog-authors', 'delete'),
  asyncHandler(BlogAuthorController.deleteAuthor)
);

export default router;
