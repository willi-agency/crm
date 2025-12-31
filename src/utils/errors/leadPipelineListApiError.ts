// src/utils/LeadPipelineListApiError.ts
export class LeadPipelineListApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LeadPipelineListApiError.prototype);
  }
}

export class LeadPipelineListNotFoundError extends LeadPipelineListApiError {
  constructor() {
    super(404, 'Coluna da pipeline não encontrada');
  }
}

