// src/utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

const asyncHandler = (
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<Response>
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
