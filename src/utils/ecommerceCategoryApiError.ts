// src/utils/EcommerceCategoryApiError.ts

export class EcommerceCategoryApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, EcommerceCategoryApiError.prototype);
  }
}

export class CategoryNotFoundError extends EcommerceCategoryApiError {
  constructor() {
    super(404, 'Categoria não encontrada');
  }
}

export class CategoryAlreadyDeletedError extends EcommerceCategoryApiError {
  constructor() {
    super(400, 'Categoria já foi deletada anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends EcommerceCategoryApiError {
  constructor() {
    super(400, 'Slug já registrado para outra categoria');
  }
}

