import { ChangeEvent, ReactNode } from 'react';

import { RadioButtonWithLabelLegacy } from './RadioButtonWithLabelLegacy';
import { getStackProps, Stack } from './Stack';

type Item = {
  value: string;
  label?: ReactNode;
  info?: string;
  checked?: boolean;
  content?: ReactNode;
  id?: string;
};

type Props = {
  name: string;
  items?: Array<Item>;
  selected: string;
  disabled?: boolean;
  className?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const RadioButtonGroupLegacy = ({
  name = '',
  items = [],
  selected,
  disabled,
  className,
  onChange,
  ...props
}: Props) => {
  return (
    <Stack className={className} as="div" spacing={3} {...getStackProps(props)}>
      <Stack as="ul" spacing={2}>
        {items.flatMap((item: Item) => {
          const itemId = item.id ?? `${name}-${item.value}`;
          const radioButton = (
            <RadioButtonWithLabelLegacy
              key={item.value}
              value={item.value}
              id={itemId}
              checked={item.value === selected}
              disabled={disabled}
              name={name}
              onChange={onChange}
              label={item.label}
              info={item.info}
            />
          );

          if (item.value !== selected || !item.content) {
            return [radioButton];
          }

          return [
            radioButton,
            <Stack as="li" key={`${item.value}-content`}>
              {item.content}
            </Stack>,
          ];
        })}
      </Stack>
    </Stack>
  );
};

export { RadioButtonGroupLegacy };
export type { Item as RadioButtonGroupItem };
