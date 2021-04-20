import { Label, LabelVariants } from './Label';

import { getStackProps, Stack } from './Stack';
import type { StackProps } from './Stack';

import { RadioButtonWithLabel } from './RadioButtonWithLabel';

type Item = { value: string; label: string; info: string };

type Props = StackProps & {
  groupLabel?: string;
  items?: Item[];
  selected: string;
};

const RadioButtonGroup = ({
  name,
  groupLabel,
  items,
  selected,
  className,
  onChange,
  ...props
}: Props) => {
  return (
    <Stack className={className} as="div" spacing={3} {...getStackProps(props)}>
      {groupLabel && <Label variant={LabelVariants.BOLD}>{groupLabel}</Label>}
      <Stack role="radiogroup" as="ul" spacing={2}>
        {items.map((item) => (
          <RadioButtonWithLabel
            key={item.value}
            value={item.value}
            checked={selected === item.value}
            id={`radio-${item.value}`}
            name={name}
            onChange={onChange}
            label={item.label}
            info={item.info}
          />
        ))}
      </Stack>
    </Stack>
  );
};

RadioButtonGroup.defaultProps = {
  name: '',
  groupLabel: '',
  items: [],
};

export { RadioButtonGroup };
