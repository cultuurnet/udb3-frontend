import { useTranslation } from 'react-i18next';

import { Countries, Country } from '@/types/Country';
import { Box } from '@/ui/Box';
import { Button } from '@/ui/Button';
import { Dropdown, DropDownVariants } from '@/ui/Dropdown';
import { Inline } from '@/ui/Inline';
import { Text } from '@/ui/Text';
import { getGlobalFormInputHeight } from '@/ui/theme';

import { FlagIcon } from './FlagIcon';

type Props = {
  value: Country;
  onChange: (value: Country) => void;
  className?: string;
};

const countries = [Countries.BE, Countries.NL, Countries.DE];

const CountryPickerLegacy = ({ value, onChange, className }: Props) => {
  const { t } = useTranslation();

  return (
    <Box
      className={className}
      css={`
        .dropdown.btn-group {
          box-shadow: none;
        }

        button.btn {
          box-shadow: none;
        }

        button.btn.dropdown-toggle {
          height: ${getGlobalFormInputHeight};
          border: var(--bs-border-width) solid var(--bs-border-color);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}
    >
      <Dropdown id="country-picker" variant={DropDownVariants.SECONDARY}>
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
    </Box>
  );
};

export { CountryPickerLegacy };
