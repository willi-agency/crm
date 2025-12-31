/* src/routes/taxonomyRoutes.ts */
import { Router } from 'express';
import { authMiddleware, permissionMiddleware } from '../../middlewares/authMiddleware';
import * as TaxonomyController from '../../controllers/blog/blogTaxonomyController';
import { createTaxonomySchema, updateTaxonomySchema } from '../../schemas/blog/taxonomySchemas';
import validate from '../../middlewares/validate';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma taxonomy
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('blog-categories', 'create'), // provisório
  asyncHandler(TaxonomyController.createTaxonomy)
);

// Rota para buscar todas as taxonomies
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('blog-categories', 'read'), // provisório
  asyncHandler(TaxonomyController.getAllTaxonomies)
);

// Rota para buscar todas as taxonomies
router.get(
  '/id/:id',
  authMiddleware,
  permissionMiddleware('blog-categories', 'read'), // provisório
  asyncHandler(TaxonomyController.getTaxonomyById)
);

// Rota para atualizar uma taxonomy
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('blog-categories', 'update'), // provisório
  asyncHandler(TaxonomyController.updateTaxonomy)
);

// Rota para deletar uma taxonomy (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('blog-categories', 'delete'), // provisório
  asyncHandler(TaxonomyController.deleteTaxonomy)
);

export default router;
