export const AGE_REFERENCE_DATE = new Date("2025-01-01T00:00:00.000Z");

export function calculateAge(birthDate: Date | string) {
  const date = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(date.getTime())) return NaN;

  const refYear = AGE_REFERENCE_DATE.getUTCFullYear();
  const refMonth = AGE_REFERENCE_DATE.getUTCMonth();
  const refDay = AGE_REFERENCE_DATE.getUTCDate();

  let age = refYear - date.getUTCFullYear();

  const monthDiff = refMonth - date.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDay < date.getUTCDate())) {
    age -= 1;
  }

  return age;
}
