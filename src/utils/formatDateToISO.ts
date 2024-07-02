import { zonedTimeToUtc } from 'date-fns-tz';

const formatDateToISO = (date: Date) => {
  return zonedTimeToUtc(date, '').toISOString().split('.')[0] + '+00:00';
};

export { formatDateToISO };
