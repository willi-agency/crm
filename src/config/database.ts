// src/config/database.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Isso evita recriar a instância em modo dev com hot reload (tipo ts-node-dev ou nodemon)
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
