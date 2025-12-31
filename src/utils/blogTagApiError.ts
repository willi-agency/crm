// src/utils/BlogTagError.ts

export class BlogTagApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, BlogTagApiError.prototype);
  }
}

export class TagNotFoundError extends BlogTagApiError {
  constructor() {
    super(404, 'Tag não encontrada');
  }
}

export class TagAlreadyDeletedError extends BlogTagApiError {
  constructor() {
    super(400, 'Tag já foi deletada anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends BlogTagApiError {
  constructor() {
    super(400, 'Slug já registrado para outra tag');
  }
}

export class TagNameTooShortError extends BlogTagApiError {
  constructor() {
    super(400, 'O nome da tag é muito curto');
  }
}

export class TagNameTooLongError extends BlogTagApiError {
  constructor() {
    super(400, 'O nome da tag é muito longo');
  }
}