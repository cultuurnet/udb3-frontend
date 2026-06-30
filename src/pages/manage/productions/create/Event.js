import truncate from 'lodash/truncate';
import { PropTypes } from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import stripHTML from 'string-strip-html';

import { CalendarType } from '@/constants/CalendarType';
import { useGetCalendarSummaryQuery } from '@/hooks/api/events';
import { Alert, AlertVariants } from '@/ui/Alert';
import { EventCard } from '@/ui/EventCard';
import { Text } from '@/ui/Text';

const Event = ({
  terms = [],
  title = '',
  id,
  locationName = '',
  locationCity = '',
  organizerName = '',
  imageUrl,
  description: rawDescription = '',
  productionName,
  calendarType = CalendarType.SINGLE,
  ...props
}) => {
  const { t, i18n } = useTranslation();

  const type = useMemo(() => {
    const typeId = terms.find((term) => term.domain === 'eventtype')?.id ?? '';
    // The custom keySeparator was necessary because the ids contain '.' which i18n uses as default keySeparator
    return t(`eventTypes*${typeId}`, { keySeparator: '*' });
  }, [t, terms]);

  const getCalendarSummaryQuery = useGetCalendarSummaryQuery({
    id,
    locale: i18n.language,
    format: calendarType === CalendarType.SINGLE ? 'lg' : 'sm',
  });

  const description = useMemo(() => {
    if (typeof document === 'undefined') return '';
    const dummyInput = document.createElement('textarea');
    dummyInput.innerHTML = stripHTML(rawDescription).result;
    const description = dummyInput.value;
    return truncate(description, { length: 750 });
  }, [rawDescription]);

  return (
    <EventCard
      {...props}
      type={type}
      title={title}
      date={getCalendarSummaryQuery.data}
      location={`${locationName} ${locationCity}`}
      organizer={organizerName}
      image={imageUrl && { src: imageUrl, alt: description }}
      description={description}
      footer={
        productionName && (
          <Alert variant={AlertVariants.PRIMARY}>
            {t('productions.event.part_of_production')}{' '}
            <Text fontWeight="bold">{productionName}</Text>
          </Alert>
        )
      }
    />
  );
};

Event.propTypes = {
  terms: PropTypes.array,
  title: PropTypes.string,
  id: PropTypes.string,
  locationName: PropTypes.string,
  locationCity: PropTypes.string,
  organizerName: PropTypes.string,
  imageUrl: PropTypes.string,
  description: PropTypes.string,
  productionName: PropTypes.string,
  calendarType: PropTypes.string,
};

export { Event };
