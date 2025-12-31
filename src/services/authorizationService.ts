import { ScopeType } from '../types/scopeType';
import {
  NotPermissionForAction,
  UndefinedEnterpriseError,
} from '../utils/errors/scopeError';

/**
 * Verifica se o escopo contém enterpriseType e enterpriseId
 */
export function validateEnterpriseScope(scope: ScopeType) {
  if (!scope.enterpriseId || !scope.enterpriseType) {
    throw new UndefinedEnterpriseError();
  }
}

export function validateEnterpriseFullScope(scope: ScopeType): asserts scope is ScopeType & { id: string } {
  if (!scope.enterpriseId || !scope.enterpriseType || !scope.id) {
    throw new UndefinedEnterpriseError();
  }
}

/**
 * Verifica se o usuário do tipo STANDARD só acessa os dados da própria empresa
*/
export function validateStandardAccess(scope: ScopeType, targetEnterpriseId: string) {
  if (scope.enterpriseType === "STANDARD" && targetEnterpriseId !== scope.enterpriseId) {
    throw new NotPermissionForAction();
  }
}

/**
 * Verifica se o usuário é MASTER
*/
export function requireMaster(scope: ScopeType) {
  if (scope.enterpriseType !== "MASTER") {
    throw new NotPermissionForAction();
  }
}

export function applyEnterpriseFilter<T extends { enterpriseId?: string }>(
  scope: ScopeType,
  filter: T = {} as T
): T {
  if (scope.enterpriseType === "STANDARD") {
    return { ...filter, enterpriseId: scope.enterpriseId };
  }
  return filter;
}

/**
 * Aplica filtro de enterpriseId baseado no scope para buscas únicas (ex.: slug)
 * 
 * Para STANDARD: força o enterpriseId do usuário
 * Para MASTER: aceita o enterpriseId passado ou undefined (todos)
 */
export function applyEnterpriseIdFilter(
  scope: ScopeType,
  enterpriseId?: string
): string | undefined {
  if (scope.enterpriseType === "STANDARD") {
    return scope.enterpriseId; // STANDARD só vê a própria empresa
  }
  // MASTER aceita enterpriseId passado ou undefined
  return enterpriseId;
}
