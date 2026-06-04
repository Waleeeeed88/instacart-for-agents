export function moneyToNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = String(value).replace(/,/g, '').match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  return match?.[1] ? Number(match[1]) : null;
}
