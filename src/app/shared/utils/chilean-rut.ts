export function normalizeChileanRut(value: string | null | undefined): string {
  const normalized = (value ?? '').replace(/[.\s-]/g, '').toUpperCase();
  return normalized.length > 1
    ? `${normalized.slice(0, -1)}-${normalized.slice(-1)}`
    : normalized;
}

export function formatChileanRut(value: string | null | undefined): string {
  const normalized = (value ?? '').replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
  if (normalized.length < 2) return normalized;

  const body = normalized.slice(0, -1);
  const verifier = normalized.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${verifier}`;
}

export function isValidChileanRut(value: string | null | undefined): boolean {
  console.log('isValidChileanRut called with value:', value);
  const normalized = (value ?? '').replace(/[.\s-]/g, '').toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(normalized)) return false;

  const rut = normalized.slice(0, -1);
  let sum = 0;
  let multiplier = 2;

  for (let index = rut.length - 1; index >= 0; index--) {
    sum += Number(rut[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expectedVerifier = remainder === 11
    ? '0'
    : remainder === 10
      ? 'K'
      : String(remainder);

  return normalized.endsWith(expectedVerifier);
}
