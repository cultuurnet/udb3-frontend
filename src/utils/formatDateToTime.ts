import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const formatDateToTime = (date: Date) => {
  return format(toZonedTime(date, 'UTC'), 'HH:mm');
};
