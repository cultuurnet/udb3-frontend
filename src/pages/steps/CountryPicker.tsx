import { useTranslation } from 'react-i18next';

import { Countries, Country } from '@/types/Country';
import { Button } from '@/ui/Button';
import { Dropdown, DropDownVariants } from '@/ui/Dropdown';
import { Inline } from '@/ui/Inline';
import { cn } from '@/ui/shadcn/utils';
import { Text } from '@/ui/Text';

import { FlagIcon } from '../../ui/FlagIcon';

type Props = {
  value: Country;
  onChange: (value: Country) => void;
  className?: string;
  showSchoolLocation?: boolean;
};

const countries = [Countries.BE, Countries.NL, Countries.DE];

const CountryPicker = ({
  value,
  onChange,
  className,
  showSchoolLocation = false,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Dropdown
      id="country-picker"
      variant={DropDownVariants.SECONDARY}
      className={cn(
        'tw:h-10 tw:shadow-none! tw:border tw:border-input tw:inline-flex tw:items-center tw:justify-center',
        className,
      )}
    >
      <Button customChildren>
        <FlagIcon country={value} />
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

export { CountryPicker };
