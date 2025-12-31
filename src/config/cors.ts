// src/config/cors.ts
import cors from 'cors';

const corsOptions = cors({
  origin: [
    process.env.FRONTEND_URL || '',
    process.env.FRONTEND_CLIENT_URL || '',
  ],  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

export default corsOptions;
