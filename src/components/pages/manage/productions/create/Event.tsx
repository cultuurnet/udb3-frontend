import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { PropTypes } from 'prop-types';
import truncate from 'lodash/truncate';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Alert' or its correspondi... Remove this comment to see the full error message
import stripHTML from 'string-strip-html';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Card' or its correspondin... Remove this comment to see the full error message
import { Alert, AlertVariants } from '@/ui/Alert';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Image' or its correspondi... Remove this comment to see the full error message
import { Card } from '@/ui/Card';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Inline' or its correspond... Remove this comment to see the full error message
import { Image } from '@/ui/Image';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Stack' or its correspondi... Remove this comment to see the full error message
import { Inline } from '@/ui/Inline';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Text' or its correspondin... Remove this comment to see the full error message
import { Stack } from '@/ui/Stack';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Title' or its correspondi... Remove this comment to see the full error message
import { Text } from '@/ui/Text';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/events' or its cor... Remove this comment to see the full error message
import { Title } from '@/ui/Title';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/CalendarType' or i... Remove this comment to see the full error message
import { useGetCalendarSummary } from '@/hooks/api/events';
import { CalendarType } from '@/constants/CalendarType';

const Event = ({
  terms,
  title,
  id,
  locationName,
  locationCity,
  organizerName,
  imageUrl,
  description: rawDescription,
  productionName,
  calendarType,
  ...props
}) => {
  const { t, i18n } = useTranslation();

  const type = useMemo(() => {
    const typeId = terms.find((term) => term.domain === 'eventtype')?.id ?? '';
    // The custom keySeparator was necessary because the ids contain '.' which i18n uses as default keySeparator
    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
    return t(`offerTypes*${typeId}`, { keySeparator: '*' });
  }, [terms]);

  const getCalendarSummaryQuery = useGetCalendarSummary({
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
    <Card {...props} spacing={5} padding={5}>
      {/* @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | undefined' is not assig... Remove this comment to see the full error message */}
      <Inline justifyContent="space-between" spacing={5}>
        <Stack spacing={4}>
          <Text>{type}</Text>
          <Stack>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Title>{title}</Title>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Text>{getCalendarSummaryQuery.data}</Text>
          </Stack>
          <Text>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            {locationName} {locationCity}
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          </Text>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          {!!organizerName && <Text>{organizerName}</Text>}
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        </Stack>
        {imageUrl && (
          <Image
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            width="10rem"
            height="10rem"
            src={imageUrl}
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            backgroundRepeat="no-repeat"
            backgroundPosition="center center"
            objectFit="cover"
          // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          />
        )}
      </Inline>

      <Text>{description}</Text>

      <Alert variant={AlertVariants.DARK} visible={!!productionName}>
        {t('productions.event.part_of_production')}{' '}
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Text fontWeight="bold">{productionName}</Text>
      </Alert>
    </Card>
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  );
};

Event.propTypes = {
  terms: PropTypes.array,
  title: PropTypes.string,
  id: PropTypes.string,
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  locationName: PropTypes.string,
  locationCity: PropTypes.string,
  organizerName: PropTypes.string,
  imageUrl: PropTypes.string,
  description: PropTypes.string,
  productionName: PropTypes.string,
  calendarType: PropTypes.string,
};

Event.defaultProps = {
  locationName: '',
  locationCity: '',
  organizerName: '',
  terms: [],
  description: '',
  title: '',
  calendarType: CalendarType.SINGLE,
};

export { Event };
