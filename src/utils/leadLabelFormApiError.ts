export class LeadLabelFormApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LeadLabelFormApiError.prototype);
  }
}

export class LabelFormNotFoundError extends LeadLabelFormApiError {
  constructor(labelName?: string) {
    super(400, `Labels do formulário inexistentes no sistema ${labelName}`);
  }
}

export class LeadFormNotFoundError extends LeadLabelFormApiError {
  constructor() {
    super(404, 'Label não encontrado');
  }
}

export class LeadFormAlreadyDeletedError extends LeadLabelFormApiError {
  constructor() {
    super(400, 'Label já foi excluído anteriormente');
  }
}

export class LeadFormAlreadyRegisteredError extends LeadLabelFormApiError {
  constructor() {
    super(400, 'Label já registrado no sistema');
  }
}
