import { format } from 'date-fns';
import { toZonedTime, utcToZonedTime } from 'date-fns-tz';

export const formatDateToTime = (date: Date) => {
  return format(utcToZonedTime(date, 'UTC'), 'HH:mm');
};
