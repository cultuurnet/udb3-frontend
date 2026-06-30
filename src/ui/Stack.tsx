import { pickBy } from 'lodash';
import { forwardRef } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { Box, BoxProps, boxPropTypes, getBoxProps, UIProp } from './Box';
import { cn } from './shadcn/utils';
import { StackLegacy } from './StackLegacy';
import { GAP_CLASS_BY_SPACING, getGapClass } from './tailwindGap';
import type { BreakpointValues } from './theme';

type StackProps = {
  spacing?: UIProp<number>;
  stackOn?: BreakpointValues;
};

type Props = BoxProps & StackProps;

const StackShadcn = forwardRef<HTMLElement, Props>(
  ({ spacing, className, children, as = 'section', ...props }, ref) => (
    <Box
      as={as}
      ref={ref}
      className={cn(
        'tw:flex tw:flex-col',
        getGapClass(spacing as number | undefined),
        className,
      )}
      {...getBoxProps(props)}
    >
      {children}
    </Box>
  ),
);

StackShadcn.displayName = 'StackShadcn';

const Stack = forwardRef<HTMLElement, Props>((props, ref) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  // Tailwind gap can't express responsive spacing objects (the theme
  // breakpoints differ from Tailwind's), and `tw:flex` would clash with a
  // caller-provided `display`. Those cases fall back to the legacy version.
  const canUseShadcn =
    isShadcnMigrationEnabled &&
    (props.spacing === undefined ||
      (typeof props.spacing === 'number' &&
        props.spacing in GAP_CLASS_BY_SPACING)) &&
    props.display === undefined;

  return canUseShadcn ? (
    <StackShadcn ref={ref} {...props} />
  ) : (
    <StackLegacy ref={ref} {...props} />
  );
});

Stack.displayName = 'Stack';

const stackPropTypes = ['spacing', 'alignItems', 'justifyContent'];

const getStackProps = (props: Record<string, any>) =>
  pickBy(props, (_value, key) => {
    // pass aria attributes to the DOM element
    if (key.startsWith('aria-')) {
      return true;
    }

    const propTypes: string[] = [...boxPropTypes, ...stackPropTypes];

    return propTypes.includes(key);
  });

export { getStackProps, Stack };
export type { Props as StackProps };
