/* src/routes/enterpriseRoute.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../middlewares/authMiddleware';
import * as EnterpriseController from '../controllers/enterpriseController';
import {
  createEnterpriseSchema,
  updateEnterpriseSchema,
} from '../schemas/enterpriseSchemas';
import validate from '../middlewares/validate';
import asyncHandler from '../utils/asyncHandler';
import { reqApiKey } from '../schemas/reqApiKeyPublicRoute';

const router: Router = Router();

// Rota para criar uma empresa
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('enterprises', 'create'),
  validate(createEnterpriseSchema),
  asyncHandler(EnterpriseController.createEnterprise)
);

// Rota para buscar todas as empresas
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(EnterpriseController.getAllEnterprises)
);

// Rota para buscar a empresa com parâmetros
router.get(
  '/id/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(EnterpriseController.getEnterpriseAllDataById)
);

// Rota para buscar uma empresa pelo Cnpj
router.get(
  '/cnpj/:cnpj',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(EnterpriseController.getEnterpriseByCnpj)
);

// Rota para atualizar uma empresa
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'update'),
  validate(updateEnterpriseSchema),
  asyncHandler(EnterpriseController.updateEnterprise)
);

// Rota para deletar empresa (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'delete'),
  validate(updateEnterpriseSchema),
  asyncHandler(EnterpriseController.deleteEnterprise)
);

// rota pública para buscar o coverage da empresa 
router.get(
  '/coverage/:apiKey',
  asyncHandler(EnterpriseController.getEnterpriseByApiKey)
);

export default router;
