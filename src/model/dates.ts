// Day math is done on local "YYYY-MM-DD" strings, never timestamps, to avoid
// DST/timezone drift (build spec §6).

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const daysBetween = (a: string, b: string): number =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
