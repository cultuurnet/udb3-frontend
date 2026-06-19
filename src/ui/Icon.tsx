import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Bell,
  Binoculars,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  Flag,
  Gift,
  Globe,
  Home,
  Image,
  Info,
  Layers,
  Link,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Share2,
  Tag,
  Ticket,
  Trash2,
  User,
  Users,
  Video,
  X,
  XCircle,
} from 'lucide-react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';

import { IconLegacy } from './IconLegacy';

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
  TIMES_CIRCLE: 'timesCircle',
  EYE: 'eye',
  EYE_SLASH: 'eyeSlash',
  SIGN_OUT: 'signOutAlt',
  CALENDAR_ALT: 'calendarAlt',
  CALENDAR_CHECK: 'calendarCheck',
  CHECK: 'check',
  CHECK_CIRCLE: 'checkCircle',
  CHECK_NOTCH: 'circleNotch',
  CHEVRON_DOWN: 'chevronDown',
  CHEVRON_RIGHT: 'chevronRight',
  PLUS: 'plus',
  TRASH: 'trash',
  BINOCULARS: 'binoculars',
  EXCLAMATION_CIRCLE: 'exclamationCircle',
  EXCLAMATION_TRIANGLE: 'exclamationTriangle',
  PENCIL: 'pencilAlt',
  VIDEO: 'video',
  COPY: 'copy',
  IMAGE: 'image',
  BUILDING: 'building',
  TICKET: 'ticket',
  INFO: 'info',
  QUESTION: 'question',
  QUESTION_CIRCLE: 'questionCircle',
  ANGLE_LEFT: 'angleLeft',
  ANGLE_RIGHT: 'angleRight',
  ARROW_LEFT: 'arrowLeft',
  SORT: 'sort',
  GLOBE: 'globe',
  LINK: 'link',
} as const;

const LucideIconsMap: Record<Values<typeof Icons>, React.ElementType> = {
  [Icons.HOME]: Home,
  [Icons.PLUS_CIRCLE]: PlusCircle,
  [Icons.SEARCH]: Search,
  [Icons.FLAG]: Flag,
  [Icons.USER]: User,
  [Icons.USERS]: Users,
  [Icons.TAG]: Tag,
  [Icons.SLIDE_SHARE]: Share2,
  [Icons.LAYER_GROUP]: Layers,
  [Icons.BELL]: Bell,
  [Icons.GIFT]: Gift,
  [Icons.TIMES]: X,
  [Icons.TIMES_CIRCLE]: XCircle,
  [Icons.EYE]: Eye,
  [Icons.EYE_SLASH]: EyeOff,
  [Icons.SIGN_OUT]: LogOut,
  [Icons.CALENDAR_ALT]: CalendarDays,
  [Icons.CALENDAR_CHECK]: CalendarCheck,
  [Icons.CHECK]: Check,
  [Icons.CHECK_CIRCLE]: CheckCircle,
  [Icons.CHECK_NOTCH]: LoaderCircle,
  [Icons.CHEVRON_DOWN]: ChevronDown,
  [Icons.CHEVRON_RIGHT]: ChevronRight,
  [Icons.PLUS]: Plus,
  [Icons.TRASH]: Trash2,
  [Icons.BINOCULARS]: Binoculars,
  [Icons.EXCLAMATION_CIRCLE]: AlertCircle,
  [Icons.EXCLAMATION_TRIANGLE]: AlertTriangle,
  [Icons.PENCIL]: Pencil,
  [Icons.VIDEO]: Video,
  [Icons.COPY]: Copy,
  [Icons.IMAGE]: Image,
  [Icons.BUILDING]: Building2,
  [Icons.TICKET]: Ticket,
  [Icons.QUESTION]: CircleHelp,
  [Icons.QUESTION_CIRCLE]: CircleHelp,
  [Icons.INFO]: Info,
  [Icons.ANGLE_LEFT]: ChevronLeft,
  [Icons.ANGLE_RIGHT]: ChevronRight,
  [Icons.ARROW_LEFT]: ArrowLeft,
  [Icons.SORT]: ArrowUpDown,
  [Icons.GLOBE]: Globe,
  [Icons.LINK]: Link,
};

type Props = {
  name: Values<typeof Icons>;
  width?: number;
  height?: number;
  className?: string;
};

const IconShadcn = ({ name, width = 18, height = 18, className }: Props) => {
  const LucideIcon = LucideIconsMap[name];
  return (
    <span className="tw:inline-flex tw:items-center">
      <LucideIcon width={width} height={height} className={className} />
    </span>
  );
};

const Icon = (props: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <IconShadcn {...props} />
  ) : (
    <IconLegacy {...props} />
  );
};

export { Icon, Icons };
export type { Props as IconProps };
