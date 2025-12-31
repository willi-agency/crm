// src/utils/UserApiError.ts

export class UserApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, UserApiError.prototype);
  }
}

export class UserNotFoundError extends UserApiError {
  constructor() {
    super(404, 'Usuário não encontrado');
  }
}

export class EmailAlreadyRegisteredError extends UserApiError {
  constructor() {
    super(400, 'Email já registrado para outro usuário');
  }
}

export class UserAlreadyDeletedError extends UserApiError {
  constructor() {
    super(400, 'Usuário já foi deletado anteriormente');
  }
}

export class UserNameTooShortError extends UserApiError {
  constructor() {
    super(400, 'O nome do usuário é muito curto');
  }
}

export class UserNameTooLongError extends UserApiError {
  constructor() {
    super(400, 'O nome do usuário é muito longo');
  }
}
