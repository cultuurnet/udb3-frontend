import { useTranslation } from 'react-i18next';

import { Countries, Country } from '@/types/Country';
import { BoxProps, getBoxProps } from '@/ui/Box';
import { Button } from '@/ui/Button';
import { Dropdown, DropDownVariants } from '@/ui/Dropdown';
import { Inline } from '@/ui/Inline';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

import { FlagIcon } from '../../ui/FlagIcon';

type Props = BoxProps & {
  value: Country;
  onChange: (value: Country) => void;
  showSchoolLocation?: boolean;
};

const getGlobalValue = getValueFromTheme('global');

const countries = [Countries.BE, Countries.NL, Countries.DE];

const CountryPicker = ({
  value,
  onChange,
  className,
  showSchoolLocation,
  ...props
}: Props) => {
  const { t } = useTranslation();

  return (
    <Dropdown
      id="country-picker"
      variant={DropDownVariants.SECONDARY}
      className={className}
      css={`
        .dropdown.btn-group {
          box-shadow: none;
        }

        & button {
          height: 2.4rem;
        }

        .btn-outline-secondary {
          box-shadow: ${getGlobalValue('boxShadow.heavy')};
        }
      `}
      {...getBoxProps(props)}
    >
      <Button customChildren>
        <FlagIcon country={value} paddingRight={1} />
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

      <Dropdown.Divider />
    </Dropdown>
  );
};

CountryPicker.defaultProps = {
  showSchoolLocation: false,
};

export { CountryPicker };
