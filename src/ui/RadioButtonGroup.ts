import PropTypes from 'prop-types';
import { Label, LabelVariants } from './Label';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Stack' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { getStackProps, Stack, stackPropTypes } from './Stack';
import { RadioButtonWithLabel } from './RadioButtonWithLabel';

const RadioButtonGroup = ({
  name,
  groupLabel,
  items,
  selected,
  className,
  onChange,
  ...props
}) => {
  return (
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'spacing'.
    <Stack className={className} as="div" spacing={3} {...getStackProps(props)}>
      // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace 'Label' as a type.
      {groupLabel && <Label variant={LabelVariants.BOLD}>{groupLabel}</Label>}
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'role'.
      <Stack role="radiogroup" as="ul" spacing={2}>
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types '{ 2: any;... Remove this comment to see the full error message
        {items.map((item) => (
          // @ts-expect-error ts-migrate(2709) FIXME: Cannot use namespace 'RadioButtonWithLabel' as a t... Remove this comment to see the full error message
          <RadioButtonWithLabel
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'key'.
            key={item.value}
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'value'.
            value={item.value}
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'checked'.
            checked={selected === item.value}
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'id'.
            id={`radio-${item.value}`}
            // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'name' because it is a constant.
            name={name}
            // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'onChange'. Did you mean 'onchang... Remove this comment to see the full error message
            onChange={onChange}
            // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
            label={item.label}
            // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
            info={item.info}
          />
        ))}
      </Stack>
    </Stack>
  );
};

RadioButtonGroup.propTypes = {
  ...stackPropTypes,
  name: PropTypes.string.isRequired,
  groupLabel: PropTypes.string,
  items: PropTypes.array,
  selected: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
};

RadioButtonGroup.defaultProps = {
  name: '',
  groupLabel: '',
  items: [],
};

export { RadioButtonGroup };
