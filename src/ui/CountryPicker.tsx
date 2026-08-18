import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Countries, Country } from '@/types/Country';
import { Button } from '@/ui/Button';
import { Dropdown, DropDownVariants } from '@/ui/Dropdown';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { cn } from '@/ui/shadcn/utils';
import { Text } from '@/ui/Text';

import { CountryPickerLegacy } from './CountryPickerLegacy';
import { FlagIcon } from './FlagIcon';

type Props = {
  value: Country;
  onChange: (value: Country) => void;
  className?: string;
  showSchoolLocation?: boolean;
};

const countries = [Countries.BE, Countries.NL, Countries.DE];

const CountryPickerShadcn = ({
  value,
  onChange,
  className,
}: Omit<Props, 'showSchoolLocation'>) => {
  const { t } = useTranslation();

  return (
    <Dropdown
      id="country-picker"
      variant={DropDownVariants.SECONDARY}
      aria-label={t('country_picker.aria_label', {
        country: t(`countries.${value}`),
      })}
      className={cn(
        'tw:h-10 tw:shadow-none! tw:border tw:border-input tw:inline-flex tw:items-center tw:justify-center',
        className,
      )}
    >
      <Button customChildren>
        <span className="tw:flex tw:items-center tw:gap-1">
          <FlagIcon country={value} />
          <Icon name={Icons.CHEVRON_DOWN} />
        </span>
      </Button>

      {countries.map((countryValue) => (
        <Dropdown.Item
          key={countryValue}
          onClick={() => onChange(countryValue)}
        >
          <Inline spacing={3}>
            <FlagIcon country={countryValue} />
            <Text>{t(`countries.${countryValue}`)}</Text>
          </Inline>
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};

const CountryPicker = ({
  value,
  onChange,
  className,
  showSchoolLocation = false,
}: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return (
      <CountryPickerShadcn
        value={value}
        onChange={onChange}
        className={className}
      />
    );
  }

  return (
    <CountryPickerLegacy
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

export { CountryPicker };
