import { startOfDay } from 'date-fns';
import { useState } from 'react';

import type { QuickLinkPeriod } from '@/ui/DatePeriodPicker';

const useQuickLinkRangeFilter = (
  eventStartDate?: Date,
  eventEndDate?: Date,
) => {
  const [quickLinkRangeError, setQuickLinkRangeError] = useState(false);

  const filterByEventRange = (
    periods: QuickLinkPeriod[],
  ): QuickLinkPeriod[] => {
    const result = periods.filter(
      (period) =>
        (!eventStartDate ||
          startOfDay(period.startDate) >= startOfDay(eventStartDate)) &&
        (!eventEndDate ||
          startOfDay(period.endDate) <= startOfDay(eventEndDate)),
    );
    setQuickLinkRangeError(result.length === 0);
    return result;
  };

  return {
    quickLinkRangeError,
    clearQuickLinkRangeError: () => setQuickLinkRangeError(false),
    filterByEventRange,
  };
};

export { useQuickLinkRangeFilter };
