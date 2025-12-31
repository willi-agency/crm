import prisma from '../config/database';

export const createLabelForm = async (data: any) => {
  return prisma.labelForm.create({
    data,
  });
};

export const findLabelFormByName = async (name: string) => {
  return prisma.labelForm.findUnique({
    where: {
      name,
    },
  });
};

export const findLabelFormById = async (id: string) => {
  return prisma.labelForm.findUnique({
    where: {
      id,
    },
  });
};

export const findAllLabels = async () => {
  return prisma.labelForm.findMany({
    where: {
      deletedAt: null,
    },
  });
};

export const softDeleteLabel = async (id: string) => {
  return prisma.labelForm.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
