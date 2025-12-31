// src/utils/errors/EnterpriseContractApiError.ts
import { AppError } from "../AppError";

export class EnterpriseContractApiError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, EnterpriseContractApiError.prototype);
  }
}

export class ContractNotFoundError extends EnterpriseContractApiError {
  constructor() {
    super(404, 'Contrato não encontrado');
  }
}

export class ContractAlreadyDeletedError extends EnterpriseContractApiError {
  constructor() {
    super(400, 'Contrato já foi deletado anteriormente');
  }
}

export class ContractAlreadyRegisteredError extends EnterpriseContractApiError {
  constructor() {
    super(400, 'Contrato já registrado no sistema');
  }
}
