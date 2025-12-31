// src/utils/EcommerceProductApiError.ts

export class EcommerceProductApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, EcommerceProductApiError.prototype);
  }
}

export class ProductNotFoundError extends EcommerceProductApiError {
  constructor() {
    super(404, 'Produto não encontrado');
  }
}

export class ProductAlreadyDeletedError extends EcommerceProductApiError {
  constructor() {
    super(400, 'Produto já foi deletada anteriormente');
  }
}

export class SlugAlreadyRegisteredError extends EcommerceProductApiError {
  constructor() {
    super(400, 'Slug já registrado para outro produto');
  }
}

