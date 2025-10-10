
const DaysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayOfWeek = (typeof DaysOfWeek)[number];

export { DaysOfWeek };
export type { DayOfWeek };
