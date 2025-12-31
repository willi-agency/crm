import cron from 'node-cron';
import { disableNotification, findPendingActivities } from '../models/lead/leadActivityModel';
import { toZonedTime } from 'date-fns-tz';

// Executa a cada 15 minutos
export const startLeadActivityCron = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Cron] Verificando atividades pendentes...');

    const activities = await findPendingActivities();

    for (const activity of activities) {
      const due = activity.dueDate;
      if (!due) continue;

      const timeZone = 'America/Sao_Paulo';
      const localNow = toZonedTime(new Date(), timeZone);
      const diffMinutes = Math.round((due.getTime() - localNow.getTime()) / (1000 * 60));

      if (diffMinutes > 0 && diffMinutes <= 60) {
        console.log(`[Aviso 1h] Atividade ${activity.id} - ${activity.title}`);

      } else if (diffMinutes >= -1 && diffMinutes <= 1) {
        console.log(`[Aviso no horário] Atividade ${activity.id} - ${activity.title}`);

      } else if (diffMinutes < 0 && diffMinutes >= -60) {
        console.log(`[Aviso atrasado] Atividade ${activity.id} - ${activity.title}`);

      } else if (diffMinutes < -90) {
        console.log(`[Desativando notificação] Atividade ${activity.id} - ${activity.title}`);
        await disableNotification(activity.id);
      }
    }
  });
};
