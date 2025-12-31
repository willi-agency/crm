// src/models/mapCoverage.ts
import prisma from '../config/database';

// 🔹 1. Buscar todos os países
export const findAllCountries = async () => {
  return prisma.mapCountry.findMany({
    orderBy: { name: 'asc' },
  });
};

// 🔹 2. Buscar estados de um país
export const findStatesByCountryId = async (countryId: string) => {
  return prisma.mapState.findMany({
    where: { countryId },
    orderBy: { name: 'asc' },
  });
};

// 🔹 3. Buscar cidades de um estado
export const findCitiesByStateId = async (stateId: string) => {
  return prisma.mapCity.findMany({
    where: { stateId },
    orderBy: { name: 'asc' },
    include: {
      districts: true,
    }
  });
};

// 🔹 4. Buscar bairros de uma cidade
export const findDistrictsByCityId = async (cityId: string) => {
  return prisma.mapDistrict.findMany({
    where: { cityId },
    orderBy: { name: 'asc' },
  });
};

export const findFullTreeByDistrictId = async (districtId: string) => {
  return prisma.mapDistrict.findUnique({
    where: { id: districtId },
    include: {
      city: {
        include: {
          state: {
            include: {
              country: true,
            },
          },
        },
      },
    },
  });
};