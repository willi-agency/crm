/* src/routes/enterpriseRoute.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as LabelFormController from '../controllers/leadLabelFormController';
import {
  createLabelFormSchema,
  getLabelFormByIdSchema,
} from '../schemas/labelFormSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar uma empresa
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('label-form', 'create'),
  validate(createLabelFormSchema),
  asyncHandler(LabelFormController.createLabelForm)
);

// Rota para buscar todas as empresas
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('label-form', 'read'),
  asyncHandler(LabelFormController.getAllLabels)
);

// Rota para buscar uma empresa pelo Cnpj
router.get(
  '/name/:name',
  authMiddleware,
  permissionMiddleware('label-form', 'read'),
  asyncHandler(LabelFormController.getLabelFormByName)
);

// Rota para deletar empresa (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('label-form', 'delete'),
  validate(getLabelFormByIdSchema),
  asyncHandler(LabelFormController.deleteLabelForm)
);

export default router;
