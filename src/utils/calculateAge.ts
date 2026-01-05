/**
 * Calculate age from a birth date string (ISO8601 format)
 * @param birthDate - Birth date in ISO8601 format (e.g., "2000-01-15T00:00:00Z")
 * @returns Age in years, or null if birthDate is invalid
 */
export function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

/**
 * Get the date that represents being exactly N years old today
 * @param years - Number of years
 * @returns Date object representing that many years ago
 */
export function getDateYearsAgo(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}
