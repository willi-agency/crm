// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { cookieOptions, secret, expiresIn } from '../config/auth';
import { getUserPermissions } from '../services/userService';
import { ScopeType } from '../types/scopeType';

interface JwtPayload {
  id: string;
  role: string;
  roleId: string;
  enterpriseId: string;
  enterpriseType: string;
  lastActivity: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Acesso negado! Token não encontrado.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const { id, roleId, role, enterpriseId, enterpriseType } = decoded;

    const now = Date.now() / 1000;
    const lastActivity = new Date(decoded.lastActivity).getTime() / 1000;
    const inactivityTimeout = 30 * 60; // 30 min

    if (now - lastActivity > inactivityTimeout) {
      res.clearCookie('token', cookieOptions);
      res.status(401).json({ message: 'Sessão expirada por inatividade.' });
      return;
    }

    // Cria o payload atualizado (sem permissions)
    const updatedPayload: JwtPayload = {
      id,
      role,
      roleId,
      enterpriseId,
      enterpriseType,
      lastActivity: new Date().toISOString(),
    };

    // Atualiza token com payload atualizado
    const updatedToken = jwt.sign(updatedPayload, secret, { expiresIn });
    res.cookie('token', updatedToken, cookieOptions);

    // Usa o payload atualizado no request
    req.user = updatedPayload;

    next();
  } catch (err) {
    console.log(err);

    if (err instanceof TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado!' });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({ message: 'Token inválido!' });
      return;
    }

    if (err instanceof NotBeforeError) {
      res.status(401).json({ message: 'Token não está ativo ainda!' });
      return;
    }

    res.status(500).json({ message: 'Erro na autenticação do token.' });
  }
};

// Middleware de permissão agora vai buscar permissões no backend
export const permissionMiddleware = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Aqui você faria uma query no DB para buscar as permissões do usuário
       const user = (req as any).user as ScopeType;
       const scope:ScopeType = { enterpriseId: user?.enterpriseId, enterpriseType: user?.enterpriseType, id: user?.id };
      const userPermissions = await getUserPermissions(req.user!.id, scope);

      const hasPermission = userPermissions.some(
        (perm) => perm.module === module && perm.action === action
      );

      if (!hasPermission) {
        res.status(403).json({ message: 'Permissão negada' });
        return;
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao verificar permissões' });
    }
  };
};