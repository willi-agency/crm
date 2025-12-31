// src/utils/LeadActivityApiError.ts
export class LeadActivityApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LeadActivityApiError.prototype);
  }
}

export class LeadActivityNotFoundError extends LeadActivityApiError {
  constructor() {
    super(404, 'Atividade não encontrada');
  }
}

export class LeadActivityAlreadyDeletedError extends LeadActivityApiError {
  constructor() {
    super(400, 'Atividade já foi deletada anteriormente');
  }
}

