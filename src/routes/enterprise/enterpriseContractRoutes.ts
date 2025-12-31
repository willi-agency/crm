/* src/routes/enterpriseContractRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as EnterpriseContractController from '../../controllers/enterprise/enterpriseContractController';
import {
  createContractSchema,
  updateContractSchema,
} from '../../schemas/enterprise/enterpriseContractSchemas';
import validate from '../../middlewares/validate';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um Contrato
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('enterprises', 'create'),
  validate(createContractSchema),
  asyncHandler(EnterpriseContractController.createContract)
);

// Rota para buscar todos os Contratos
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(EnterpriseContractController.getAllContracts)
);

// Rota para buscar um Contrato pelo Código
router.get(
  '/code/:code',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(EnterpriseContractController.getContractByCode)
);

// Rota para atualizar um Contrato
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'update'),
  validate(updateContractSchema),
  asyncHandler(EnterpriseContractController.updateContract)
);

// Rota para deletar Contrato (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'delete'),
  asyncHandler(EnterpriseContractController.deleteContract)
);

export default router;
