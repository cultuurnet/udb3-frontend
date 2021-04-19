import PropTypes from 'prop-types';
import {
  RadioButton,
  radioButtonDefaultProps,
  radioButtonPropTypes,
} from './RadioButton';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Inline' was resolved to '/Users/simondeb... Remove this comment to see the full error message
import { getInlineProps, Inline, inlinePropTypes } from './Inline';
import { Label } from './Label';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Stack' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { Stack } from './Stack';
import { Text } from './Text';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('radioButtonWithLabel');

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
}) => {
  return (
    <Inline
      className={className}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'alignItems'.
      alignItems="flex-start"
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'spacing'.
      spacing={3}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
      as="li"
      {...getInlineProps(props)}
    >
      // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace
      'RadioButton' as a type.
      <RadioButton
        id={id}
        onChange={onChange}
        value={value}
        name={name}
        checked={checked}
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'css'.
        css={`
          // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
          margin-top: 0.36rem;
        `}
      />
      <Stack>
        // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace 'Label'
        as a type.
        <Label cursor="pointer" htmlFor={id}>
          // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope
          for the shorthand propert... Remove this comment to see the full error
          message
          {label}
        </Label>
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'info'.
        {!!info && <Text color={getValue('infoTextColor')}>{info}</Text>}
      </Stack>
    </Inline>
  );
};

RadioButtonWithLabel.propTypes = {
  ...inlinePropTypes,
  ...radioButtonPropTypes,
  label: PropTypes.node,
  info: PropTypes.string,
};

RadioButtonWithLabel.defaultprops = {
  ...radioButtonDefaultProps,
};

export { RadioButtonWithLabel };
