// src/models/apiKeyModel.ts
import prisma from '../config/database';
import { ApiKeyFilterType } from '../types/apiKeyFilterType';

// Função para criar uma ApiKey
export const createApiKey = async (data: any) => {
  return prisma.apiKey.create({
    data,
  });
};

// Função para buscar apiKey por key
export const findApiKeyByKey = async (
  key: string,
  where?: { enterpriseId?: string }
) => {
  return prisma.apiKey.findUnique({
    where: {
      revoked: false,
      key,
      ...where,
    },
  });
};

// Função para buscar apiKey por id
export const findApiKeyById = async (id: string) => {
  return prisma.apiKey.findUnique({
    where: { revoked: false, id },
  });
};

// Função para listar todas as apiKeys
export const findAllApiKeys = async (
  where?: { enterpriseId?: string },
  filter: ApiKeyFilterType = {}
) => {
  return prisma.apiKey.findMany({
    where: {
      revoked: false,
      ...where,
      ...filter,
    },
    include: {
      enterprise: {
        select: { id: true, name: true },
      },
    },
  });
};

// Função para atualizar uma apiKey
export const updateApiKey = async (
  id: string,
  data: any
) => {
  return prisma.apiKey.update({
    where: { revoked: false, id },
    data,
  });
};

// Função para deletar uma apiKey
export const softDeleteApiKey = async (id: string) => {
  return prisma.apiKey.update({
    where: { id },
    data: {
      revoked: true,
    },
  });
};
