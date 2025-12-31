// src/server.ts
import dotenv from 'dotenv';
import app from './app';
import { connectRedis } from './config/redis';

dotenv.config();

const PORT = process.env.PORT || 3004;

async function startServer() {
  try {
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
