import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Stack' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { getStackProps, Stack, stackPropTypes } from './Stack';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Inline' was resolved to '/Users/simondeb... Remove this comment to see the full error message
import { Inline } from './Inline';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, parseSpacing } from './Box';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('detailTable');

const DetailTable = ({ items, className, ...props }) => {
  return (
    <Stack
      as="table"
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
      backgroundColor={getValue('backgroundColor')}
      className={className}
      {...getStackProps(props)}
    >
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
      <Stack as="tbody">
        // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'string' a... Remove this comment to see the full error message
        {items.map(({ header, value }, index) => (
          <Inline
            key={index}
            forwardedAs="tr"
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'key'.
            padding={3}
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'forwardedAs'.
            css={
              // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'padding'.
              index !== items.length - 1
                // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'css'. Did you mean 'CSS'?
                ? (props) => {
                    return `border-bottom: 1px solid ${getValue('borderColor')(
                      props,
                    )};`;
                  }
                : undefined
            }
          >
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
            <Box as="th" minWidth={parseSpacing(7)()} fontWeight="bold">
              // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'minWidth'.
              {header}
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
            </Box>
            // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'string' a... Remove this comment to see the full error message
            <Box as="td">{value}</Box>
          </Inline>
        ))}
      // @ts-expect-error ts-migrate(2365) FIXME: Operator '>' cannot be applied to types 'string' a... Remove this comment to see the full error message
      </Stack>
    </Stack>
  );
};

DetailTable.propTypes = {
  ...stackPropTypes,
  items: PropTypes.arrayOf(
    PropTypes.shape({ header: PropTypes.string, value: PropTypes.string }),
  ),
  className: PropTypes.string,
};

DetailTable.defaultProps = {
  items: [],
};

export { DetailTable };
