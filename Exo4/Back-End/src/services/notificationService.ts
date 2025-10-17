import logger from '../utils/logger';

// Envoie une notification d'information dans les logs
export function notifyInfo(message: string) {
  logger.info(message);
  console.log(`[INFO] ${message}`); // affiche les logs dans la console
}

export default {
  notifyInfo,
};
