// src/utils/keywordPageApiError.ts

export class KeywordPageApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, KeywordPageApiError.prototype);
  }
}

export class KeywordPageNotFoundError extends KeywordPageApiError {
  constructor() {
    super(404, 'Keyword Page não encontrada');
  }
}

export class KeywordPageAlreadyDeletedError extends KeywordPageApiError {
  constructor() {
    super(400, 'Keyword Page já foi deletada anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends KeywordPageApiError {
  constructor() {
    super(400, 'Slug já registrado para outra Keyword Page');
  }
}

export class KeywordAlreadyRegisteredError extends KeywordPageApiError {
  constructor() {
    super(400, 'Keyword já está registrado.');
  }
}
