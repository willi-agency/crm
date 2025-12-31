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

// Função para listar todos os usuários
export const findAllUsers = async () => {
  return prisma.user.findMany({
    include: { role: true, enterprise: true },
  });
};

// Função para atualizar uma author
export const updateUser = async (id: string, data: any) => {
  return prisma.author.update({
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
