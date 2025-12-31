import { ErrorRequestHandler } from 'express';

export const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      statusCode: 400,
      message: 'Corpo da requisição com JSON inválido. Verifique a formatação.',
    });
  } else {
    // Passa o erro para o próximo middleware de erro
    next(err); // Apenas chama o next sem retornar o Response
  }
};
