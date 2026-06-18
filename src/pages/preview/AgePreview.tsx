import { format, parse } from 'date-fns';
import { Trans, useTranslation } from 'react-i18next';

import { AgeRanges } from '@/constants/AgeRange';
import { BirthdateRange } from '@/types/Offer';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

const getGlobalValue = getValueFromTheme('global');

const formatCustomAgeRange = (ageRange: string) => {
  const [min, max] = ageRange.split('-');
  if (min && !max) {
    return `${min}+`;
  }
  return ageRange;
};

type Props = {
  typicalAgeRange: string;
  childrenOnly?: boolean;
  birthdateRange?: BirthdateRange;
};

const ChildrenOnlyLabel = () => {
  const { t } = useTranslation();

  return (
    <Inline alignItems="center" spacing={2}>
      <Icon name={Icons.CHECK_CIRCLE} color={getGlobalValue('successColor')} />
      <Text>{t('preview.children_only')}</Text>
    </Inline>
  );
};

const AgePreview = ({
  typicalAgeRange,
  childrenOnly,
  birthdateRange,
}: Props) => {
  const { t } = useTranslation();

  const hasAgeInfo = typicalAgeRange;

  if (!hasAgeInfo) return null;

  if (typicalAgeRange === '-' || typicalAgeRange === '0-') {
    return <Text>{t('create.name_and_age.age.all')}</Text>;
  }

  const ageRangeLabelKey = Object.keys(AgeRanges).find((key) => {
    const ageRange = AgeRanges[key];
    return ageRange.apiLabel === typicalAgeRange;
  });

  const ageText = AgeRanges[ageRangeLabelKey]
    ? AgeRanges[ageRangeLabelKey].label
    : formatCustomAgeRange(typicalAgeRange);

  const formattedFrom = birthdateRange?.from
    ? format(parse(birthdateRange.from, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
    : null;
  const formattedTo = birthdateRange?.to
    ? format(parse(birthdateRange.to, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
    : null;

  return (
    <Stack spacing={2}>
      <Text>{t('preview.ages', { ages: ageText })}</Text>
      {formattedFrom && formattedTo && (
        <Text>
          <Trans
            i18nKey="preview.birth_years"
            values={{ from: formattedFrom, to: formattedTo }}
            components={{ bold: <strong /> }}
          />
        </Text>
      )}
      {childrenOnly && <ChildrenOnlyLabel />}
    </Stack>
  );
};

export { AgePreview };
