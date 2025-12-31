/* src/routes/roleRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as RoleController from '../controllers/roleController';
import { createRoleSchema } from '../schemas/roleSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um cargo
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('users-roles', 'create'),
  validate(createRoleSchema),
  asyncHandler(RoleController.createRole)
);

// Rota para buscar todos os cargos
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('users-roles', 'read'),
  asyncHandler(RoleController.getAllRoles)
);

router.get(
  '/all/:enterpriseId',
  authMiddleware,
  permissionMiddleware('users-roles', 'read'),
  asyncHandler(RoleController.getAllRolesByEnterprise)
);

// Rota para atualizar um cargo
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('users-roles', 'update'),
  asyncHandler(RoleController.updateRole)
);

// Rota para deletar cargo (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('users-roles', 'delete'),
  asyncHandler(RoleController.deleteRole)
);

export default router;
