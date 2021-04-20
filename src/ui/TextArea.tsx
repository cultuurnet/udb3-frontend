import { Form } from 'react-bootstrap';

import { Box, getBoxProps } from './Box';
import type { BoxProps } from './Box';

type Props = BoxProps & {
  value?: string;
  onInput?: () => void;
  disabled?: boolean;
  rows?: number;
};

const BaseInput = (props: Props) => <Box as="textarea" {...props} />;

const TextArea = ({
  id,
  className,
  onInput,
  value,
  disabled,
  rows,
  ...props
}: Props) => {
  return (
    <Form.Control
      forwardedAs={BaseInput}
      id={id}
      className={className}
      width="100%"
      minHeight="4rem"
      onInput={onInput}
      value={value}
      disabled={disabled}
      css="border-radius: 0;"
      rows={rows}
      {...getBoxProps(props)}
    />
  );
};

TextArea.defaultProps = {
  value: '',
  disabled: false,
  rows: 3,
  onInput: () => {},
};

export { TextArea };
