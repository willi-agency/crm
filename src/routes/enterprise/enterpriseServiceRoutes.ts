/* src/routes/enterpriseServiceRoutes.ts */
import { Router } from 'express';
import {
  authMiddleware,
  permissionMiddleware,
} from '../../middlewares/authMiddleware';
import * as EnterpriseServiceController from '../../controllers/enterprise/enterpriseServiceController';
import {
  createServiceSchema,
  updateServiceSchema,
} from '../../schemas/enterprise/enterpriseServiceSchemas';
import validate from '../../middlewares/validate';
import asyncHandler from '../../utils/asyncHandler';

const router: Router = Router();

// Rota para criar um Contrato
router.post(
  '/create',
  authMiddleware,
  permissionMiddleware('enterprises', 'create'),
  validate(createServiceSchema),
  asyncHandler(EnterpriseServiceController.createService)
);

// Rota para buscar todos os Contratos
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(EnterpriseServiceController.getAllServices)
);

// Rota para buscar um Contrato pelo Código
router.get(
  '/id/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'read'),
  asyncHandler(EnterpriseServiceController.getServiceById)
);

// Rota para atualizar um Contrato
router.patch(
  '/update/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'update'),
  validate(updateServiceSchema),
  asyncHandler(EnterpriseServiceController.updateService)
);

// Rota para deletar Contrato (soft delete)
router.patch(
  '/delete/:id',
  authMiddleware,
  permissionMiddleware('enterprises', 'delete'),
  asyncHandler(EnterpriseServiceController.deleteService)
);

export default router;
