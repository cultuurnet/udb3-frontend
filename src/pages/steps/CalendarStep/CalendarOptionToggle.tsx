import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Box, parseSpacing } from '@/ui/Box';
import { CustomIcon, CustomIconVariants } from '@/ui/CustomIcon';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { ToggleBox } from '@/ui/ToggleBox';
import { Tooltip } from '@/ui/Tooltip';

import {
  useIsFixedDays,
  useIsOneOrMoreDays,
} from '../machines/calendarMachine';

type CalendarOptionToggleProps = InlineProps & {
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
  ...props
}: CalendarOptionToggleProps) => {
  const { t } = useTranslation();
  const isOneOrMoreDays = useIsOneOrMoreDays();
  const isFixedDays = useIsFixedDays();

  const [isCultuurkuurFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.CULTUURKUUR,
  );

  return (
    <Inline spacing={5} alignItems="stretch" {...getInlineProps(props)}>
      <ToggleBox
        onClick={onChooseOneOrMoreDays}
        active={isOneOrMoreDays}
        icon={
          <CustomIcon name={CustomIconVariants.CALENDAR_SINGLE} width="80" />
        }
        text={t('create.calendar.types.one_or_more_days')}
        minHeight={parseSpacing(7)}
        flex={1}
      />
      {!(isCultuurkuurFeatureFlagEnabled && isCultuurkuurEvent) && (
        <ToggleBox
          onClick={onChooseFixedDays}
          active={isFixedDays}
          icon={
            <CustomIcon
              name={CustomIconVariants.CALENDAR_MULTIPLE}
              width="80"
            />
          }
          text={t('create.calendar.types.fixed_days')}
          minHeight={parseSpacing(7)}
          flex={1}
          disabled={disableChooseFixedDays}
        />
      )}
      {isCultuurkuurFeatureFlagEnabled && isCultuurkuurEvent && (
        <ToggleBox
          onClick={onChooseFixedDays}
          active={isFixedDays}
          icon={
            <CustomIcon
              name={CustomIconVariants.CULTUURKUUR_CALENDAR}
              width="80"
            />
          }
          text={
            <Inline spacing={2}>
              <Box>
                <p>{t('create.calendar.types.cultuurkuur')}</p>
              </Box>
              <Tooltip
                content={t('create.calendar.types.cultuurkuur_tip')}
                id={t('create.calendar.types.cultuurkuur_tip')}
                placement="bottom"
              />
            </Inline>
          }
          minHeight={parseSpacing(7)}
          flex={1}
          disabled={disableChooseFixedDays}
        />
      )}
    </Inline>
  );
};
