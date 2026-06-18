import { Text } from '@/ui/Text';

import type { TextProps } from './Text';

type Props = TextProps;

const ParagraphLegacy = (props: Props) => (
  <Text as="p" maxWidth="45rem" lineHeight="140%" {...props} />
);

export { ParagraphLegacy };
