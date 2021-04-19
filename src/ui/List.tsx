import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Stack' was resolved to '/Users/simondebr... Remove this comment to see the full error message
import { getStackProps, Stack, stackPropTypes } from './Stack';

import { Children } from 'react';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Inline' was resolved to '/Users/simondeb... Remove this comment to see the full error message
import { Inline, getInlineProps, inlinePropTypes } from './Inline';

const ListVariants = {
  ORDERED: 'ordered',
  UNORDERED: 'unordered',
};

const List = ({ children, className, variant, ...props }) => (
  <Stack
    forwardedAs={variant === ListVariants.ORDERED ? 'ol' : 'ul'}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'variant' does not exist on type 'ListPro... Remove this comment to see the full error message
    className={className}
    variant={variant}
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    {...getStackProps(props)}
  >
    {children}
  </Stack>
);

List.propTypes = {
  ...stackPropTypes,
  className: PropTypes.string,
  children: PropTypes.node,
};

List.defaultProps = {
  variant: ListVariants.UNORDERED,
};

const ListItem = ({ children, className, onClick, ...props }) => {
  const parsedChildren =
    Children.count(children) === 1 ? <>{children}</> : children;

  return (
    <Inline
      as="li"
      className={className}
      onClick={onClick}
      {...getInlineProps(props)}
    >
      {parsedChildren}
    </Inline>
  );
};

ListItem.propTypes = {
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  ...inlinePropTypes,
  className: PropTypes.string,
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  children: PropTypes.node,
  onClick: PropTypes.func,
};

List.Item = ListItem;

export { List };
