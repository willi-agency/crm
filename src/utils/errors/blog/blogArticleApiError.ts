// src/utils/BlogArticleApiError.ts
import { AppError } from "../AppError";

export class BlogArticleApiError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, BlogArticleApiError.prototype);
  }
}

export class ArticleNotFoundError extends BlogArticleApiError {
  constructor() {
    super(404, 'Artigo não encontrado');
  }
}

export class ArticleAlreadyDeletedError extends BlogArticleApiError {
  constructor() {
    super(400, 'Artigo já foi deletado anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends BlogArticleApiError {
  constructor() {
    super(400, 'Slug do artigo já registrado no sistema');
  }
}

export class NotExistData extends BlogArticleApiError {
  constructor() {
    super(400, 'Nenhum dado encontrado para essa empresa');
  }
}
