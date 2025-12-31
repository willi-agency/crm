export type EnterpriseType = 'MASTER' | 'STANDARD';

export interface ScopeType {
  enterpriseId: string;
  enterpriseType: EnterpriseType;
  id?: String;
}
