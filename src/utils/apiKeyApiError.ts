// src/utils/ApiKeyApiError.ts

export class ApiKeyApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiKeyApiError.prototype);
  }
}

export class ApiKeyNotFoundError extends ApiKeyApiError {
  constructor() {
    super(404, 'API Key não encontrada');
  }
}

export class ApiKeyAlreadyDeletedError extends ApiKeyApiError {
  constructor() {
    super(400, 'API Key já foi revogada anteriormente');
  }
}

export class ApiKeyAlreadyRegisteredError extends ApiKeyApiError {
  constructor() {
    super(400, 'API Key já registrada no sistema');
  }
}
