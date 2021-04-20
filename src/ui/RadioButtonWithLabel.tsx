import { RadioButton, radioButtonDefaultProps } from './RadioButton';

import { getInlineProps, Inline } from './Inline';
import type { InlineProps } from './Inline';

import { Label } from './Label';
import { Stack } from './Stack';
import { Text } from './Text';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('radioButtonWithLabel');

type Props = InlineProps & {
  label: React.ReactNode;
  info: string;
};

const RadioButtonWithLabel = ({
  id,
  name,
  disabled,
  onChange,
  label,
  info,
  value,
  checked,
  className,
  ...props
}: Props) => {
  return (
    <Inline
      className={className}
      alignItems="flex-start"
      spacing={3}
      as="li"
      {...getInlineProps(props)}
    >
      <RadioButton
        id={id}
        onChange={onChange}
        value={value}
        name={name}
        checked={checked}
        css={`
          margin-top: 0.36rem;
        `}
      />
      <Stack>
        <Label cursor="pointer" htmlFor={id}>
          {label}
        </Label>
        {!!info && <Text color={getValue('infoTextColor')}>{info}</Text>}
      </Stack>
    </Inline>
  );
};

RadioButtonWithLabel.defaultprops = {
  ...radioButtonDefaultProps,
};

export { RadioButtonWithLabel };
