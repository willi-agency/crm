// src/utils/errors/campaign/utmSubmissionApiError.ts
import { AppError } from "../AppError";

export class UtmSubmissionApiError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, UtmSubmissionApiError.prototype);
  }
}

// === Errors específicos ===

// Submission não encontrado
export class UtmSubmissionNotFoundError extends UtmSubmissionApiError {
  constructor() {
    super(404, "UTM Submission não encontrada");
  }
}

// Submission já foi deletada
export class UtmSubmissionAlreadyDeletedError extends UtmSubmissionApiError {
  constructor() {
    super(400, "UTM Submission já foi deletada anteriormente");
  }
}

// Já existe uma Submission igual
export class UtmSubmissionAlreadyExistsError extends UtmSubmissionApiError {
  constructor() {
    super(400, "UTM Submission com os mesmos campos já registrada");
  }
}

// Nenhum dado encontrado para a empresa
export class UtmSubmissionNoDataError extends UtmSubmissionApiError {
  constructor() {
    super(400, "Nenhum dado encontrado para essa empresa");
  }
}
