import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const formatDateToTime = (date: Date) => {
  return format(utcToZonedTime(date, ''), 'HH:mm');
};
