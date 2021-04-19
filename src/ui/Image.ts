import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(6142) FIXME: Module './Box' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Box, boxPropTypes, getBoxProps } from './Box';

const Image = ({ src, alt, className, ...props }) => (
  <Box
    as="img"
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'as'.
    src={src}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'src'.
    alt={alt}
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'alt'.
    className={className}
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'className'. Did you mean 'classN... Remove this comment to see the full error message
    {...getBoxProps(props)}
  />
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'props'.
);

Image.propTypes = {
  ...boxPropTypes,
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

Image.defaultProps = {
  width: 600,
  height: 'auto',
};

export { Image };
