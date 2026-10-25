import { HttpErrorResponse } from '@angular/common/http';

function extractMessage(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const message = value.trim();
    return message || undefined;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const body = value as Record<string, unknown>;
  return extractMessage(body['message']) ?? extractMessage(body['error']);
}

export function getHttpErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    return extractMessage(error.error) ?? fallback;
  }

  if (error instanceof Error) {
    return error.message.trim() || fallback;
  }

  return fallback;
}
