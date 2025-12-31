// src/utils/BlogCategoryApiError.ts

export class BlogCategoryApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, BlogCategoryApiError.prototype);
  }
}

export class CategoryNotFoundError extends BlogCategoryApiError {
  constructor() {
    super(404, 'Categoria não encontrada');
  }
}

export class CategoryAlreadyDeletedError extends BlogCategoryApiError {
  constructor() {
    super(400, 'Categoria já foi deletada anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends BlogCategoryApiError {
  constructor() {
    super(400, 'Slug já registrado para outra categoria');
  }
}

