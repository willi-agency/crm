// src/utils/BlogAuthorApiError.ts
import { AppError } from "../AppError";

export class BlogAuthorApiError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, BlogAuthorApiError.prototype);
  }
}

export class AuthorNotFoundError extends BlogAuthorApiError {
  constructor() {
    super(404, 'Autor não encontrado');
  }
}

export class AuthorAlreadyDeletedError extends BlogAuthorApiError {
  constructor() {
    super(400, 'Autor já foi deletado anteriormente');
  }
}

export class ProfileAlreadyRegisteredError extends BlogAuthorApiError {
  constructor() {
    super(400, 'Autor já registrado no sistema');
  }
}
