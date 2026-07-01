import type { ClosingPeriodData } from './ClosingPeriod';
import type { DeviatingPeriodData } from './DeviatingPeriod';

const sortPeriods = (items: ClosingPeriodData[] | DeviatingPeriodData[]) =>
  [...items].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

export { sortPeriods };
