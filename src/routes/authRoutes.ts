// src/routes/authRoutes.ts
import { Router } from 'express';
import { login, logout } from '../controllers/authController';
import { loginSchema } from '../schemas/authSchemas';
import validate from '../middlewares/validate';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

export default router;
