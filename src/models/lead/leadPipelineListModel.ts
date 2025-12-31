// src/model
import prisma from '../../config/database';

export const createLeadPipelineList = async (data: any) => {
  return prisma.leadPipelineList.create({
    data,
  });
};