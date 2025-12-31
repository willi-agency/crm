/* src\models\userModel.ts */
import prisma from '../config/database';

// Função para buscar usuário por email
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      enterprise: true,
    },
  });
};

// Função para criar um novo usuário
export const createUser = async (data: any) => {
  return prisma.user.create({
    data,
    include: { role: true, enterprise: true },
  });
};

// Função para buscar usuário por ID
export const findUserById = async (
  id: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.user.findUnique({
    where: {
      deletedAt: null,
      id,
      ...where,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      enterprise: true,
    },
  });
};

interface FindPermissionsWhere {
  userId: string;
  enterpriseId?: string;
}

export const findPermissions = async (where: FindPermissionsWhere) => {
  const { userId, enterpriseId } = where;

  const userWithPermissions = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            where: enterpriseId ? { role: { enterpriseId } } : undefined,
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!userWithPermissions) return [];

  // Mapeia as permissões para o formato { module, action }
  const permissions = userWithPermissions.role?.permissions?.map((p) => ({
    module: p.permission.module,
    action: p.permission.action,
  })) || [];

  return permissions;
};

// Função para listar todos os usuários
export const findAllUsers = async (where?: { enterpriseId?: string }) => {
  return prisma.user.findMany({
    where: {
      ...where,
    },
    include: { role: true, enterprise: true },
  });
};

// Função para atualizar uma usuário
export const updateUser = async (id: string, data: any) => {
  return prisma.user.update({
    where: {
      deletedAt: null,
      id,
    },
    data,
  });
};

// Função para deletar uma categoria
export const softDeleteUser = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
