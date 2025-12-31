// src/services/roleService.ts
import { ScopeType } from '../types/scopeType';
import * as RoleModel from '../models/roleModel';
import * as UserModel from '../models/userModel';
import {
  RoleAlreadyDeletedError,
  RoleNotFoundError,
  RoleApiError,
} from '../utils/roleApiError';
import {
  UndefinedEnterpriseError,
  NotPermissionForAction,
} from '../utils/errors/scopeError';
import { RoleCreateDTO, RoleUpdateDTO } from '../types/roleType';
import { UserNotFoundError } from '../utils/userApiError';

export const createRole = async (data: RoleCreateDTO, scope: ScopeType, userId: string) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, enterpriseId: recEnterpriseId, permissions } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  const user = await UserModel.findUserById(userId);
  if (!user) {
    throw new UserNotFoundError();
  }

  const userPermissionIds = user?.role.permissions.map((perm: any) => perm.permissionId);
  const hasInvalidPermission = permissions.some(
    (permissionId) => !userPermissionIds.includes(permissionId)
  );

  if (hasInvalidPermission) {
    throw new NotPermissionForAction();
  }

  // 1. Verifica se o usuário tem permissão para editar
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  const existingPermissions = await RoleModel.getPermissionsByIds(data.permissions);
  if (existingPermissions.length !== data.permissions.length) {
    throw new RoleNotFoundError();
  }

  try {
    const role = await RoleModel.createRole({
      name,
      enterprise: {
        connect: { id: recEnterpriseId },
      },
    });

    const cadPermissions = await Promise.all(
      permissions.map((permissionId) =>
        RoleModel.createRolePermissions({
          role: { connect: { id: role.id } },
          permission: { connect: { id: permissionId } },
        })
      )
    );

    return {
      message: 'role cadastrado com sucesso!',
      role,
    };
    
  } catch (error) {
    if (error instanceof RoleApiError) {
      throw error;
    }

    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllRoles = async (scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const roles = await RoleModel.findAllRoles(where);
    return roles || [];
  } catch (error) {
    if (error instanceof RoleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const getAllRolesByEnterprise = async (
  scope: ScopeType,
  enterpriseId: string
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  if (scope.enterpriseType === 'STANDARD' && scope.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  try {
    const roles = await RoleModel.findAllRolesByEnterprise(enterpriseId);
    return roles || [];
  } catch (error) {
    if (error instanceof RoleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};

export const updateRole = async (
  id: string,
  data: RoleUpdateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, enterpriseId: recEnterpriseId, permissions } = data;

  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Busca o role existente
  const existingRole = await RoleModel.findRoleById(id);
  if (!existingRole) {
    throw new RoleNotFoundError();
  }

  // 2. Verifica se o usuário tem permissão para editar
  if (
    enterpriseType === "STANDARD" &&
    existingRole.enterpriseId !== enterpriseId
  ) {
    throw new NotPermissionForAction();
  }

  try {
    // 🔹 Atualiza apenas os dados básicos da Role
    const updatedRole = await RoleModel.updateRole(id, {
      ...(name && { name }),
      ...(recEnterpriseId && {
        enterprise: { connect: { id: recEnterpriseId } },
      }),
    });

    // 🔹 Se permissões forem passadas, substitui todas
    if (permissions && permissions.length > 0) {
      // Remove permissões antigas
      await RoleModel.deleteRolePermissions(id);

      // Adiciona permissões novas
      await Promise.all(
        permissions.map((permissionId) =>
          RoleModel.createRolePermissions({
            role: { connect: { id } },
            permission: { connect: { id: permissionId } },
          })
        )
      );
    }

    return {
      message: "Role atualizada com sucesso!",
      role: updatedRole,
    };
  } catch (error) {
    console.error("❌ Erro no updateRole:", error);
    if (error instanceof RoleApiError) {
      throw error;
    }
    throw new Error("Erro interno ao atualizar a role");
  }
};


export const deleteRole = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se o role existe antes de tentar deletá-la
  const role = await RoleModel.findRoleById(id);

  if (!role) {
    throw new RoleNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (enterpriseType === 'STANDARD' && role?.enterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (role.deletedAt !== null) {
    throw new RoleAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await RoleModel.softDeleteRole(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar o role');
    }

    return result;
  } catch (error) {
    if (error instanceof RoleApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o lead e os dados');
  }
};
