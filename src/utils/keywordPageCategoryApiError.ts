// src/utils/KeywordPageCategoryApiError.ts

export class KeywordPageCategoryApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, KeywordPageCategoryApiError.prototype);
  }
}

export class CategoryNotFoundError extends KeywordPageCategoryApiError {
  constructor() {
    super(404, 'Categoria não encontrada');
  }
}

export class CategoryAlreadyDeletedError extends KeywordPageCategoryApiError {
  constructor() {
    super(400, 'Categoria já foi deletada anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends KeywordPageCategoryApiError {
  constructor() {
    super(400, 'Slug já registrado para outra categoria');
  }
}

