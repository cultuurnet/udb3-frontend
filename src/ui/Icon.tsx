import { faSlideshare } from '@fortawesome/free-brands-svg-icons';
import {
  faBell,
  faBinoculars,
  faCheck,
  faCheckCircle,
  faChevronDown,
  faChevronRight,
  faCircleNotch,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faFlag,
  faGift,
  faHome,
  faLayerGroup,
  faPencilAlt,
  faPlus,
  faPlusCircle,
  faSearch,
  faSignOutAlt,
  faTag,
  faTimes,
  faTrash,
  faUser,
  faUsers,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { Values } from '@/types/Values';

import type { BoxProps } from './Box';
import { Box, getBoxProps, parseDimension } from './Box';

const Icons = {
  HOME: 'home',
  PLUS_CIRCLE: 'plusCircle',
  SEARCH: 'search',
  FLAG: 'flag',
  USER: 'user',
  USERS: 'users',
  TAG: 'tag',
  SLIDE_SHARE: 'slideShare',
  LAYER_GROUP: 'layerGroup',
  BELL: 'bell',
  GIFT: 'gift',
  TIMES: 'times',
  EYE: 'eye',
  EYE_SLASH: 'eyeSlash',
  SIGN_OUT: 'signOutAlt',
  CHECK: 'check',
  CHECK_CIRCLE: 'checkCircle',
  CHECK_NOTCH: 'circleNotch',
  CHEVRON_DOWN: 'chevronDown',
  CHEVRON_RIGHT: 'chevronRight',
  PLUS: 'plus',
  TRASH: 'trash',
  BINOCULARS: 'binoculars',
  EXCLAMATION_TRIANGLE: 'exclamationTriangle',
  PENCIL: 'pencilAlt',
  VIDEO: 'video',
} as const;

const IconsMap = {
  [Icons.HOME]: faHome,
  [Icons.PLUS_CIRCLE]: faPlusCircle,
  [Icons.SEARCH]: faSearch,
  [Icons.FLAG]: faFlag,
  [Icons.USER]: faUser,
  [Icons.USERS]: faUsers,
  [Icons.TAG]: faTag,
  [Icons.SLIDE_SHARE]: faSlideshare,
  [Icons.LAYER_GROUP]: faLayerGroup,
  [Icons.BELL]: faBell,
  [Icons.GIFT]: faGift,
  [Icons.TIMES]: faTimes,
  [Icons.EYE]: faEye,
  [Icons.EYE_SLASH]: faEyeSlash,
  [Icons.SIGN_OUT]: faSignOutAlt,
  [Icons.CHECK]: faCheck,
  [Icons.CHECK_CIRCLE]: faCheckCircle,
  [Icons.CHECK_NOTCH]: faCircleNotch,
  [Icons.CHEVRON_DOWN]: faChevronDown,
  [Icons.CHEVRON_RIGHT]: faChevronRight,
  [Icons.PLUS]: faPlus,
  [Icons.TRASH]: faTrash,
  [Icons.BINOCULARS]: faBinoculars,
  [Icons.EXCLAMATION_TRIANGLE]: faExclamationTriangle,
  [Icons.PENCIL]: faPencilAlt,
  [Icons.VIDEO]: faVideo,
};

type Props = Omit<BoxProps, 'width' | 'height'> & {
  name: Values<typeof Icons>;
  width?: number;
  height?: number;
};

const Icon = ({ name, width, height, className, ...props }: Props) => {
  return (
    <Box
      className={className}
      css={`
        .svg-inline--fa {
          width: ${parseDimension(width)};
          height: ${parseDimension(height)};
        }
      `}
      {...getBoxProps(props)}
    >
      <FontAwesomeIcon icon={IconsMap[name]} />
    </Box>
  );
};

Icon.defaultProps = {
  width: 15,
  height: 15,
};

export { Icon, Icons };
