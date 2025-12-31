// src/middlewares/errorHandler.ts
import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors/AppError";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Dados de entrada inválidos",
      details: err.errors.map(e => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  res.status(500).json({
    message: "Erro interno do servidor",
    details:
      process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
