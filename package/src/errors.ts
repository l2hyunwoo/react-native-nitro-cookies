import { CookieErrorCode } from './types';
import type { CookieError } from './types';

export function normalizeCookieError(
  cause: unknown,
  context: Pick<CookieError, 'url' | 'cookieName'> = {},
  fallbackCode: CookieErrorCode = CookieErrorCode.STORAGE_ERROR
): CookieError {
  const original =
    cause !== null && (typeof cause === 'object' || typeof cause === 'function')
      ? (cause as { message?: unknown; code?: unknown; stack?: unknown })
      : undefined;
  let message: string;
  try {
    message =
      typeof original?.message === 'string' ? original.message : String(cause);
  } catch {
    message = 'Cookie operation failed';
  }
  const nativeMessage = message.replace(/^NitroCookies\.\w+\(\.\.\.\): /, '');
  // Nitro preserves NSError descriptions and Java exception prefixes as text.
  const nativeCode =
    /^(?:java\.lang\.\w+: )?([A-Z_]+):(?:\s|$)/.exec(nativeMessage)?.[1] ??
    /^Error Domain=([A-Z_]+) Code=-?\d+(?:\s|$)/.exec(nativeMessage)?.[1];
  const error = new Error(message) as CookieError;
  error.code =
    typeof original?.code === 'string' && original.code.length > 0
      ? original.code
      : (Object.values(CookieErrorCode).find((code) => code === nativeCode) ??
        fallbackCode);
  error.cause = cause;
  if (typeof original?.stack === 'string') error.stack = original.stack;
  if (context.url !== undefined) error.url = context.url;
  if (context.cookieName !== undefined) error.cookieName = context.cookieName;
  return error;
}
