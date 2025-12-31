import axios from 'axios';
import { findEnterpriseById } from '../models/enterpriseModel';

const WEBHOOK_VPS_DEPLOY = process.env.WEBHOOK_VPS_DEPLOY;

export const triggerEnterpriseRedeploy = async (enterpriseId: string) => {
  const enterprise = await findEnterpriseById(enterpriseId);

  console.log(enterprise);

  if (!enterprise?.webhookDeploy) {
    console.error(`Nenhum webhookDeploy configurado para enterpriseId: ${enterpriseId}`);
    return
  }

  if (!WEBHOOK_VPS_DEPLOY) {
    console.error(`Token WEBHOOK_VPS_DEPLOY não está definido no .env`);
    return
  }

  try {
    await axios.get(enterprise.webhookDeploy, {
      headers: {
        Authorization: `Bearer ${WEBHOOK_VPS_DEPLOY}`,
      },
    });
  } catch (error) {
    console.log(error);
    console.error(`Erro ao disparar redeploy para enterprise ${enterpriseId}: ${error}`);
  }
};
