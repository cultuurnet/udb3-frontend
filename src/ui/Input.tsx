import { Form } from 'react-bootstrap';
import { getBoxProps, Box } from './Box';
import type { BoxProps } from './Box';

type InputProps = {
  type?: string;
  placeholder?: string;
  onInput?: () => void;
  value?: string;
};

type Props = BoxProps & InputProps;

const BaseInput = (props: Props) => <Box as="input" {...props} />;

const Input = ({
  type,
  id,
  placeholder,
  onInput,
  className,
  value,
  ...props
}: Props) => (
  <Form.Control
    forwardedAs={BaseInput}
    id={id}
    type={type}
    placeholder={placeholder}
    className={className}
    maxWidth="43rem"
    css="border-radius: 0;"
    onInput={onInput}
    value={value}
    {...getBoxProps(props)}
  />
);

Input.defaultProps = {
  type: 'text',
  placeholder: '',
  onInput: () => {},
  value: '',
};

export { Input };
export type { InputProps };
