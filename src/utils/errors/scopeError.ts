// src/utils/scopeError.ts
export class ScopeError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ScopeError.prototype);
  }
}

export class UndefinedEnterpriseError extends ScopeError {
  constructor() {
    super(400, 'Usuário indefinido');
  }
}

export class NotPermissionForAction extends ScopeError {
  constructor() {
    super(403, 'Você não tem permissão para essa ação.');
  }
}
