export function isTodayOrTomorrow(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDayAfterTomorrow = new Date(startOfToday);
  startOfDayAfterTomorrow.setDate(startOfDayAfterTomorrow.getDate() + 2);

  return d >= startOfToday && d < startOfDayAfterTomorrow;
}