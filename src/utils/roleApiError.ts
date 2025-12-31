// src/utils/roleApiError.ts

export class RoleApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, RoleApiError.prototype);
  }
}

export class RoleNotFoundError extends RoleApiError {
  constructor() {
    super(404, 'Artigo não encontrado');
  }
}

export class RoleAlreadyDeletedError extends RoleApiError {
  constructor() {
    super(400, 'Artigo já foi deletado anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends RoleApiError {
  constructor() {
    super(400, 'Slug do artigo já registrado no sistema');
  }
}
