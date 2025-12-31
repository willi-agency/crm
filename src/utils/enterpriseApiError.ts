// src/utils/EnterpriseApiError.ts

export class EnterpriseApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, EnterpriseApiError.prototype);
  }
}

export class EnterpriseNotFoundError extends EnterpriseApiError {
  constructor() {
    super(404, 'Empresa não encontrada');
  }
}

export class EnterpriseAlreadyDeletedError extends EnterpriseApiError {
  constructor() {
    super(400, 'Empresa já foi deletada anteriormente');
  }
}

export class CnpjAlreadyRegisteredError extends EnterpriseApiError {
  constructor() {
    super(400, 'CNPJ já registrado para outra empresa');
  }
}

export class EnterpriseNameTooShortError extends EnterpriseApiError {
  constructor() {
    super(400, 'O nome da tag é muito curto');
  }
}

export class EnterpriseNameTooLongError extends EnterpriseApiError {
  constructor() {
    super(400, 'O nome da tag é muito longo');
  }
}
