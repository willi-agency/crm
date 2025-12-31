// src/routes/userRoutes.ts
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as UserController from '../controllers/userController';
import { createUserSchema, updateUserSchema } from '../schemas/userSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um usuário
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('users', 'create'),
  validate(createUserSchema),
  asyncHandler(UserController.createUser)
);

// Rota para buscar todos os usuários
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('users', 'read'),
  asyncHandler(UserController.getAllUsers)
);

// Rota para buscar um usuário pelo email
router.get(
  '/email/:email',
  authMiddleware,
  permissionMiddleware('users', 'read'),
  asyncHandler(UserController.getUserByEmail)
);

// Rota para atualizar um usuário
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'update'),
  validate(updateUserSchema),
  asyncHandler(UserController.updateUser)
);

// Rota para buscar um usuário pelo ID
router.get(
  '/id/:id',
  authMiddleware,
  permissionMiddleware('users', 'read'),
  asyncHandler(UserController.getUserById)
);

export default router;
