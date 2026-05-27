import { useTranslation } from 'react-i18next';

import { AgeRanges } from '@/constants/AgeRange';
import { AudienceTypes } from '@/constants/AudienceType';
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
  audienceType?: string;
};

const AgePreview = ({ typicalAgeRange, audienceType }: Props) => {
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

  const ChildrenOnlyLabel = () => (
    <Inline alignItems="center" spacing={2}>
      <Icon name={Icons.CHECK_CIRCLE} color={getGlobalValue('successColor')} />
      <Text>{t('preview.children_only')}</Text>
    </Inline>
  );

  return (
    <Stack spacing={2}>
      <Text>{t('preview.ages', { ages: ageText })}</Text>
      {audienceType === AudienceTypes.CHILDREN_ONLY && <ChildrenOnlyLabel />}
    </Stack>
  );
};

export { AgePreview };
