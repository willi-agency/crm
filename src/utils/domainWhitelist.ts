// src/utils/domainWhitelist.ts
import prisma from '../config/database';

let cachedDomains: string[] = [];
let lastFetched = 0;
const TTL = 1000 * 60 * 5; // 5 minutos

export const getAllowedDomains = async (): Promise<string[]> => {
  const now = Date.now();
  if (cachedDomains.length === 0 || now - lastFetched > TTL) {
    const enterprises = await prisma.enterprise.findMany({
      select: { domain: true },
      where: { deletedAt: null }, // opcional: só ativos
    });

    cachedDomains = enterprises
      .map(e => e.domain)
      .filter((d): d is string => typeof d === 'string'); // <- aqui está a mágica

    lastFetched = now;
  }

  return cachedDomains;
};
