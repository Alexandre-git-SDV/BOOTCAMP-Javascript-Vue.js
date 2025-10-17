export function now(): string {
  return new Date().toISOString();
}

export function info(msg: string) { console.log(`[${now()}] [INFO] ${msg}`); }
export function warn(msg: string) { console.warn(`[${now()}] [WARN] ${msg}`); }
export function error(msg: string) { console.error(`[${now()}] [ERROR] ${msg}`); }

export default { info, warn, error };
