import { HttpError } from './http-error.js';

export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  label = 'operation',
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await operation(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new HttpError(`${label} timed out after ${timeoutMs}ms`, 504, error);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
