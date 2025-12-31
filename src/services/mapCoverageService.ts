// src/services/mapCoverageService.ts
import { ScopeType } from '../types/scopeType';
import * as MapCoverage from '../models/mapCoverage';
import {
  UndefinedEnterpriseError,
} from '../utils/errors/scopeError';

export const getAllCountries = async (
  scope: ScopeType,
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const countries = await MapCoverage.findAllCountries();
    return countries || [];
  } catch (error) {
    throw new Error('Erro ao buscar os países');
  }
};

export const getStatesByCountryId = async (
  countryId: string,
  scope: ScopeType,
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const states = await MapCoverage.findStatesByCountryId(countryId);
    return states || [];
  } catch (error) {
    throw new Error('Erro ao buscar os estados');
  }
};

export const getCitiesByStateId = async (
  stateId: string,
  scope: ScopeType,
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const cities = await MapCoverage.findCitiesByStateId(stateId);
    return cities || [];
  } catch (error) {
    throw new Error('Erro ao buscar as cidades');
  }
};

export const getDistrictsByCityId = async (
  cityId: string,
  scope: ScopeType,
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const districts = await MapCoverage.findDistrictsByCityId(cityId);
    return districts || [];
  } catch (error) {
    throw new Error('Erro ao buscar os bairros');
  }
};

export const getFullTreeByDistrictId = async (
  districtId: string,
  scope: ScopeType,
) => {
  if (!scope.enterpriseType || !scope.enterpriseId) {
    throw new UndefinedEnterpriseError();
  }

  try {
    const tree = await MapCoverage.findFullTreeByDistrictId(districtId);
    return tree;
  } catch (error) {
    throw new Error('Erro ao buscar a hierarquia do bairro');
  }
};
