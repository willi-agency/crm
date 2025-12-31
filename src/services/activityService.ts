import { redisClient } from '../config/redis';

const EXPIRATION_MINUTES = 30;

export async function updateLastActivity(userId: string) {
  try {
    const now = Date.now();
    // Salva ou atualiza a última atividade do usuário
    await redisClient.set(`lastActivity:${userId}`, now.toString());
  } catch (err) {
    console.error('Erro ao atualizar última atividade no Redis:', err);
    throw new Error('Erro ao atualizar última atividade');
  }
}

export async function validateLastActivity(userId: string): Promise<boolean> {
  try {
    const lastActivity = await redisClient.get(`lastActivity:${userId}`);

    if (!lastActivity) {
      await updateLastActivity(userId);
      const test = await redisClient.get(`lastActivity:${userId}`);
      return true;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const minutesInactive = (now - lastActivityTime) / (1000 * 60);

    return minutesInactive <= EXPIRATION_MINUTES;
  } catch (err) {
    console.error('Erro ao validar última atividade no Redis:', err);
    return false;
  }
}
