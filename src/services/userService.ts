// src/services/userService.ts
import bcrypt from 'bcrypt';
import * as UserModel from '../models/userModel';
import {
  EmailAlreadyRegisteredError,
  UserAlreadyDeletedError,
  UserApiError,
  UserNotFoundError,
} from '../utils/userApiError';
import { sanitizeUser } from '../utils/sanitize';
import { ScopeType } from '../types/scopeType';
import { userCreateDTO, userUpdateDTO } from '../types/userSchema';
import {
  NotPermissionForAction,
  UndefinedEnterpriseError,
} from '../utils/errors/scopeError';
import { findRoleById } from '../models/roleModel';

export const createUser = async (data: userCreateDTO, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, email, password, roleId, enterpriseId: recEnterpriseId } = data;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para editar
  if (enterpriseType === 'STANDARD' && recEnterpriseId !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  const enterpiseRole = await findRoleById(roleId);
  if (enterpiseRole?.enterpriseId !== recEnterpriseId) {
    throw new NotPermissionForAction();
  }
  // Verificação prevista: email já cadastrado
  const existingUser = await UserModel.findUserByEmail(email);
  if (existingUser) {
    throw new EmailAlreadyRegisteredError();
  }

  try {
    // Hash da senha e criação do usuário
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: { connect: { id: roleId } },
      enterprise: { connect: { id: recEnterpriseId } },
    });

    return {
      message: 'Usuário cadastrado com sucesso!',
      user: sanitizeUser(user),
    };
  } catch (error) {
    if (error instanceof UserApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o usuário');
  }
};

export const getAllUsers = async (scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  const where =
  scope.enterpriseType === 'MASTER'
  ? undefined
  : { enterpriseId: scope.enterpriseId };
  try {
    const users = await UserModel.findAllUsers(where);
    return users || [];
  } catch (error) {
    if (error instanceof UserApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o usuário');
  }
};

export const getUserByEmail = async (email: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // 1. Verifica se o usuário tem permissão para consultar
  if (enterpriseType !== 'MASTER') {
    throw new NotPermissionForAction();
  }

  try {
    const users = await UserModel.findUserByEmail(email);

    if (!users) {
      return 'Nenhum usuário encontrada';
    }

    // Se for MASTER, retorna todos os slugs com esse nome
    return users;
  } catch (error) {
    if (error instanceof UserApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o usuário');
  }
};

export const getUserById = async (id: string, scope: ScopeType) => {
  if (scope.enterpriseType === 'STANDARD' && id !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }
  const where =
    scope.enterpriseType === 'STANDARD' && scope.enterpriseId
      ? { enterpriseId: scope.enterpriseId }
      : undefined;

  try {
    const users = await UserModel.findUserById(id, where);

    if (!users) {
      throw new UserNotFoundError();
    }

    return users;
  } catch (error) {
    if (error instanceof UserApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o usuário');
  }
};

export const getUserPermissions = async (userId: string, scope: ScopeType) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Se for STANDARD, só permite consultar permissões da própria empresa
  const where =
    scope.enterpriseType === 'STANDARD'
      ? { enterpriseId: scope.enterpriseId, userId }
      : { userId }; // MASTER pode acessar todas as permissões do usuário

  try {
    const permissions = await UserModel.findPermissions(where);

    if (!permissions || permissions.length === 0) {
      // Retorna array vazio se não houver permissões
      return [];
    }

    // Mapeia para o formato que vamos usar no middleware
    return permissions.map((p) => ({
      module: p.module,
      action: p.action,
    }));
  } catch (error) {
    console.error('Erro ao buscar permissões do usuário', error);
    throw new Error('Erro interno ao buscar permissões do usuário');
  }
};

export const updateUser = async (
  id: string,
  data: userUpdateDTO,
  scope: ScopeType
) => {
  const { enterpriseType, enterpriseId } = scope;
  const { name, email, password, roleId } = data;

  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  const existingUser = await UserModel.findUserById(id);
  if (!existingUser) {
    throw new UserNotFoundError();
  }

  if (enterpriseType === 'STANDARD' && existingUser.id !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (email) {
    const userWithSameEmail = await UserModel.findUserByEmail(email);
    if (userWithSameEmail && userWithSameEmail.id !== id) {
      throw new EmailAlreadyRegisteredError();
    }
  }

  // Monta o objeto dinamicamente só com os campos enviados
  const updateData: any = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password){
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  } 
  if (roleId) updateData.role = { connect: { id: roleId } };

  try {
    const result = await UserModel.updateUser(id, updateData);

    if (!result) {
      throw new Error('Erro ao tentar atualizar o usuário');
    }

    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof UserApiError) {
      throw error;
    }
    throw new Error('Erro interno ao atualizar o usuário');
  }
};

export const deleteUser = async (id: string, scope: ScopeType) => {
  const { enterpriseType, enterpriseId } = scope;

  // Validação do escopo
  if (!enterpriseType || !enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  // Verificando se a enterprise existe antes de tentar deletá-la
  const enterprise = await UserModel.findUserById(id);
  if (!enterprise) {
    throw new UserNotFoundError();
  }

  // 1. Verifica se o usuário tem permissão para editar (importante validar antes de buscar slug duplicado)
  if (enterpriseType === 'STANDARD' && enterprise?.id !== enterpriseId) {
    throw new NotPermissionForAction();
  }

  if (enterprise.deletedAt !== null) {
    throw new UserAlreadyDeletedError();
  }

  try {
    // Chamando o modelo para fazer o soft delete
    const result = await UserModel.softDeleteUser(id);

    // Verificando se a operação foi bem-sucedida (dependendo da implementação do seu modelo)
    if (!result) {
      throw new Error('Erro ao tentar deletar a enterprise');
    }

    return result;
  } catch (error) {
    if (error instanceof UserApiError) {
      throw error;
    }
    // Senão, lança erro genérico
    throw new Error('Erro interno ao criar o usuário');
  }
};
