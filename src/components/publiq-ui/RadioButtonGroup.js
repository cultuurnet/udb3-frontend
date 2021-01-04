import PropTypes from 'prop-types';
import { Label, LabelVariants } from './Label';
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
    <Stack className={className} as="div" spacing={3} {...getStackProps(props)}>
      {groupLabel && <Label variant={LabelVariants.BOLD}>{groupLabel}</Label>}
      <Stack role="radiogroup" as="ul" spacing={2}>
        {items.map((item) => (
          <RadioButtonWithLabel
            key={item.value}
            value={item.value}
            selected={selected === item.value}
            id={`radio-${item.value}`}
            name={name}
            onChange={onChange}
            label={item.label}
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
