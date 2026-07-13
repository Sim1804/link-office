export const daysFromNow = (days: number): string => {
  const date = new Date("2026-07-13T12:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

export const percent = (completed: number, total: number): number => total === 0 ? 0 : Math.round((completed / total) * 100);
