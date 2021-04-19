import PropTypes from 'prop-types';
import { Label, LabelVariants } from './Label';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Inline' was resolved to '/Users/simondeb... Remove this comment to see the full error message
import { getInlineProps, Inline, inlinePropTypes } from './Inline';
import { Input, inputPropTypes } from './Input';

const InputWithLabel = ({
  type,
  id,
  label,
  placeholder,
  className,
  onInput,
  ...props
}) => (
  <Inline
    className={className}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
    as="div"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'spacing'.
    spacing={3}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'alignItems'.
    alignItems="center"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'props'.
    {...getInlineProps(props)}
  >
    // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace 'Label' as a type.
    <Label htmlFor={id} variant={LabelVariants.BOLD}>
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'label'. Did you mean 'Label'?
      {label}
    </Label>
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'type'.
    <Input type={type} id={id} placeholder={placeholder} onInput={onInput} />
  </Inline>
);

InputWithLabel.propTypes = {
  ...inlinePropTypes,
  ...inputPropTypes,
  label: PropTypes.string,
};

InputWithLabel.defaultProps = {
  type: 'text',
};

export { InputWithLabel };
