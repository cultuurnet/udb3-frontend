import { Label, LabelVariants } from './Label';

import { getStackProps, Stack } from './Stack';
import type { StackProps } from './Stack';

import { TextArea } from './TextArea';

type Props = StackProps & {
  label: string;
  onInput: () => void;
};

const TextAreaWithLabel = ({
  id,
  label,
  className,
  onInput,
  value,
  disabled,
  ...props
}: Props) => {
  return (
    <Stack as="div" spacing={3} className={className} {...getStackProps(props)}>
      <Label htmlFor={id} variant={LabelVariants.BOLD}>
        {label}
      </Label>
      <TextArea id={id} onInput={onInput} value={value} disabled={disabled} />
    </Stack>
  );
};

export { TextAreaWithLabel };
