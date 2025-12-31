// src/config/publicCors.ts
import cors from 'cors';

const publicCors = cors({
  origin: true,
  credentials: true,
  methods: ['POST', 'GET'],
});

export default publicCors;
