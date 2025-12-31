import { AppError } from "../AppError";

export class TaxonomyApiError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, TaxonomyApiError.prototype);
  }
}

export class TaxonomyNotFoundError extends TaxonomyApiError {
  constructor() {
    super(404, 'Taxonomy não encontrada');
  }
}

export class TaxonomyAlreadyDeletedError extends TaxonomyApiError {
  constructor() {
    super(400, 'Taxonomy já foi deletada anteriormente');
  }
}

export class TaxonomyAlreadyRegisteredError extends TaxonomyApiError {
  constructor() {
    super(400, 'Taxonomy já registrada no sistema');
  }
}
