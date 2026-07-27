import { useTranslation } from 'react-i18next';

import { Box } from '@/ui/Box';
import { CustomIcon, CustomIconVariants } from '@/ui/CustomIcon';
import { Inline } from '@/ui/Inline';
import { ToggleBox } from '@/ui/ToggleBox';
import { Tooltip } from '@/ui/Tooltip';

import {
  useIsFixedDays,
  useIsOneOrMoreDays,
} from '../machines/calendarMachine';

type CalendarOptionToggleProps = {
  onChooseOneOrMoreDays: () => void;
  onChooseFixedDays: () => void;
  disableChooseFixedDays?: boolean;
  isCultuurkuurEvent: boolean;
};

export const CalendarOptionToggle = ({
  onChooseOneOrMoreDays,
  onChooseFixedDays,
  disableChooseFixedDays,
  isCultuurkuurEvent,
}: CalendarOptionToggleProps) => {
  const { t } = useTranslation();
  const isOneOrMoreDays = useIsOneOrMoreDays();
  const isFixedDays = useIsFixedDays();

  const fixedDaysToggleProps = isCultuurkuurEvent
    ? {
        iconName: CustomIconVariants.CULTUURKUUR_CALENDAR,
        text: (
          <Inline spacing={2}>
            <Box as="p">{t('create.calendar.types.cultuurkuur')}</Box>
            <Tooltip
              content={t('create.calendar.types.cultuurkuur_tip')}
              id={t('create.calendar.types.cultuurkuur_tip')}
              side="bottom"
            />
          </Inline>
        ),
      }
    : {
        iconName: CustomIconVariants.CALENDAR_MULTIPLE,
        text: t('create.calendar.types.fixed_days'),
      };

  return (
    <div className="tw:mb-4.5 tw:flex tw:w-full tw:items-stretch tw:gap-8.5">
      <ToggleBox
        onClick={onChooseOneOrMoreDays}
        active={isOneOrMoreDays}
        icon={
          <CustomIcon name={CustomIconVariants.CALENDAR_SINGLE} width="80" />
        }
        title={t('create.calendar.types.one_or_more_days')}
        description={t('create.calendar.types.one_or_more_days_example')}
        className="tw:min-h-34 tw:flex-1"
      />

      <ToggleBox
        onClick={onChooseFixedDays}
        active={isFixedDays}
        icon={<CustomIcon name={fixedDaysToggleProps.iconName} width="80" />}
        title={fixedDaysToggleProps.text}
        description={
          !isCultuurkuurEvent && t('create.calendar.types.fixed_days_example')
        }
        className="tw:min-h-34 tw:flex-1"
        disabled={disableChooseFixedDays}
      />
    </div>
  );
};
