import { format, parse } from 'date-fns';
import { Trans, useTranslation } from 'react-i18next';

import { AgeRanges } from '@/constants/AgeRange';
import { BirthdateRange } from '@/types/Offer';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
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
      <Icon name={Icons.CHECK_CIRCLE} className="tw:text-success" />
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

  const hasAgeInfo = typicalAgeRange || childrenOnly || birthdateRange;

  if (!hasAgeInfo) return null;

  const ageRangeLabelKey = Object.keys(AgeRanges).find((key) => {
    const ageRange = AgeRanges[key];
    return ageRange.apiLabel === typicalAgeRange;
  });

  const isAllAges = typicalAgeRange === '-' || typicalAgeRange === '0-';
  const rangeLabel = typicalAgeRange
    ? (AgeRanges[ageRangeLabelKey]?.label ??
      formatCustomAgeRange(typicalAgeRange))
    : null;
  const ageText = isAllAges ? t('create.name_and_age.age.all') : rangeLabel;

  const formattedFrom = birthdateRange?.from
    ? format(parse(birthdateRange.from, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
    : null;
  const formattedTo = birthdateRange?.to
    ? format(parse(birthdateRange.to, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
    : null;

  return (
    <Stack spacing={2}>
      {ageText && <Text>{t('preview.ages', { ages: ageText })}</Text>}
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
