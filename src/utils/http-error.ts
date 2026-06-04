export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly causeDetail?: unknown;

  constructor(message: string, statusCode = 500, causeDetail?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.causeDetail = causeDetail;
  }
}

export function statusFromError(error: unknown): number {
  return error instanceof HttpError ? error.statusCode : 500;
}

export function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
