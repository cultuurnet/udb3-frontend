import type { ClosingPeriodData } from './ClosingPeriod';
import type { DeviatingPeriodData } from './DeviatingPeriod';

const sortPeriods = <T extends ClosingPeriodData | DeviatingPeriodData>(
  items: T[],
): T[] =>
  [...items].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

export { sortPeriods };
