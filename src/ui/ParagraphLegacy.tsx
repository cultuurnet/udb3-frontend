import { cn } from '@/ui/shadcn/utils';
import { Text } from '@/ui/Text';

import type { TextProps } from './Text';

type Props = TextProps;

const ParagraphLegacy = ({ className, ...props }: Props) => (
  <Text
    as="p"
    className={cn('tw:max-w-180 tw:leading-[140%]', className)}
    {...props}
  />
);

export { ParagraphLegacy };
