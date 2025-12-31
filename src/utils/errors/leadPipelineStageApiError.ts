// src/utils/LeadPipelineStageApiError.ts
export class LeadPipelineStageApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LeadPipelineStageApiError.prototype);
  }
}

export class LeadPipelineStageNotFoundError extends LeadPipelineStageApiError {
  constructor() {
    super(404, 'Coluna da pipeline não encontrada');
  }
}

export class LeadPipelineStageAlreadyDeletedError extends LeadPipelineStageApiError {
  constructor() {
    super(400, 'Coluna da Pipeline já foi deletada anteriormente');
  }
}

