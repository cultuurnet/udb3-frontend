import { formatISO } from 'date-fns';

const formatDateToISO = (date: Date) => {
  return formatISO(date).split('+')[0] + '+00:00';
};

export { formatDateToISO };
