// src/utils/errors/EnterpriseServiceApiError.ts
import { AppError } from "../AppError";

export class EnterpriseServiceApiError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, EnterpriseServiceApiError.prototype);
  }
}

export class ServiceNotFoundError extends EnterpriseServiceApiError {
  constructor() {
    super(404, 'Contrato não encontrado');
  }
}

export class ServiceAlreadyDeletedError extends EnterpriseServiceApiError {
  constructor() {
    super(400, 'Contrato já foi deletado anteriormente');
  }
}

export class ServiceAlreadyRegisteredError extends EnterpriseServiceApiError {
  constructor() {
    super(400, 'Contrato já registrado no sistema');
  }
}
