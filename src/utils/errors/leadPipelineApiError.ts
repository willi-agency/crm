// src/utils/LeadPipelineApiError.ts
export class LeadPipelineApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LeadPipelineApiError.prototype);
  }
}

export class LeadPipelineNotFoundError extends LeadPipelineApiError {
  constructor() {
    super(404, 'Pipeline não encontrada');
  }
}

export class LeadPipelineAlreadyDeletedError extends LeadPipelineApiError {
  constructor() {
    super(400, 'Pipeline já foi deletada anteriormente');
  }
}

