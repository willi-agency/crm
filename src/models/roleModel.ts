// src/models/roleModel.ts
import prisma from '../config/database';

// Função para criar uma role
export const createRole = async (data:any) => {
  return prisma.role.create({
    data,
  });
};

// Função para buscar role por Slug
export const findRoleByName = async (
  name: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.role.findMany({
    where: {
      deletedAt: null,
      name,
      ...where,
    },
    include: {
      permissions: true,
    },
  });
};

// Função para buscar artigo por id
export const findRoleById = async (id: string) => {
  return prisma.role.findUnique({
    where: {
      deletedAt: null,
      id,
    },
    include: {
      permissions: true,
    },
  });
};

// Função para listar todas os cargos da empresa
export const findAllRoles = async (where?: { enterpriseId?: string }) => {
  return prisma.role.findMany({
    where: {
      deletedAt: null,
      ...where,
    },
    select: {
      id: true,
      name: true,
      enterpriseId: true,
      enterprise: {
        select: {
          name: true,
        },
      },
    }
  });
};

export const findAllRolesByEnterprise = async (enterpriseId: string) => {
  return prisma.role.findMany({
    where: {
      deletedAt: null,
      enterpriseId,
    },
    include: {
      enterprise: true,
    },
  });
};

// Função para atualizar uma role
export const updateRole = async (id: string, data:any) => {
  return prisma.role.update({
    where: { id },     // 🔧 obrigatório
    data,              // 🔧 dados que vêm da service
    include: { permissions: true, enterprise: true },
  });
};

// Função para deletar uma categoria
export const softDeleteRole = async (id: string) => {
  return prisma.role.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const getRoleById = async (data: string[]) => {
  return prisma.permission.findMany({
    where: {
      id: { in: data },
    },
  });
};

export const createRolePermissions = async (
  data: any
) => {
  return prisma.rolePermission.create({
    data,
  });
};

export const getPermissionsByIds = async (ids: string[]) => {
  return prisma.permission.findMany({
    where: { id: { in: ids } },
  });
};

// Função para deletar todas as permissões de uma role
export const deleteRolePermissions = async (roleId: string) => {
  return prisma.rolePermission.deleteMany({
    where: { roleId },
  });
};
