let fallbackCounter = 0;

export function getUniqueKey(...parameters: unknown[]): string {
  const prefix = parameters.length
    ? `${parameters.map(String).join('-')}-`
    : '';

  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}${globalThis.crypto.randomUUID()}`;
  }

  fallbackCounter += 1;
  return `${prefix}${Date.now().toString(36)}-${fallbackCounter.toString(36)}`;
}
