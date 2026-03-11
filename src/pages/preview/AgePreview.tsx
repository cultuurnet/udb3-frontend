import { useTranslation } from 'react-i18next';

import { AgeRanges } from '@/constants/AgeRange';
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
};

const AgePreview = ({ typicalAgeRange }: Props) => {
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

  return <Text>{t('preview.ages', { ages: ageText })}</Text>;
};

export { AgePreview };
