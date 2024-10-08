import { formatISO, subMilliseconds } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';

const formatDateToISO = (date: Date) => {
  const offset = getTimezoneOffset('Europe/Brussels');

  return formatISO(subMilliseconds(date, offset)).split('+')[0] + '+00:00';
};

export { formatDateToISO };
