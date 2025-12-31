// src/utils/LeadSubmitApiError.ts

export class LeadSubmitApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LeadSubmitApiError.prototype);
  }
}

export class LeadSubmitNotFoundError extends LeadSubmitApiError {
  constructor() {
    super(404, 'Lead não encontrado');
  }
}

export class NotPermissionDataEmpty extends LeadSubmitApiError {
  constructor() {
    super(400, 'É necessário informar ao menos um dado no formulário.');
  }
}

export class LeadSubmitAlreadyDeletedError extends LeadSubmitApiError {
  constructor() {
    super(400, 'Lead já foi excluído anteriormente');
  }
}

export class LeadSubmitAlreadyRegisteredError extends LeadSubmitApiError {
  constructor() {
    super(400, 'Lead já registrado no sistema');
  }
}
