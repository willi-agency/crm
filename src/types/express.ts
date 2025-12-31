// src/types/express/index.d.ts

import * as express from 'express';

declare global {
  namespace Express {
    interface Response {
      cookie: (name: string, value: string, options?: any) => void;
    }
  }
}
