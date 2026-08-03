export const log = {
  debug: (...args: any[]) => console.debug('[AllegroParser]', ...args),
  info: (...args: any[]) => console.info('[AllegroParser]', ...args),
  warn: (...args: any[]) => console.warn('[AllegroParser]', ...args),
  error: (...args: any[]) => console.error('[AllegroParser]', ...args),
};
