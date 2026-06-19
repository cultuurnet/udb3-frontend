import { pickBy } from 'lodash';
import { forwardRef } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { Box, BoxProps, boxPropTypes, getBoxProps, UIProp } from './Box';
import { InlineLegacy } from './InlineLegacy';
import { cn } from './shadcn/utils';
import { GAP_CLASS_BY_SPACING, getGapClass } from './tailwindGap';
import type { BreakpointValues } from './theme';

type InlineProps = {
  spacing?: UIProp<number>;
  stackOn?: BreakpointValues;
};

type Props = BoxProps & InlineProps;

const InlineShadcn = forwardRef<HTMLElement, Props>(
  ({ spacing, className, children, as = 'span', ...props }, ref) => (
    <Box
      as={as}
      ref={ref}
      className={cn(
        'tw:flex',
        getGapClass(spacing as number | undefined),
        className,
      )}
      {...getBoxProps(props)}
    >
      {children}
    </Box>
  ),
);

InlineShadcn.displayName = 'InlineShadcn';

const Inline = forwardRef<HTMLElement, Props>((props, ref) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  // Tailwind gap can't express responsive spacing objects or `stackOn`
  // (the theme breakpoints differ from Tailwind's), and `tw:flex` would clash
  // with a caller-provided `display`. Those cases fall back to the legacy
  // version.
  const canUseShadcn =
    isShadcnMigrationEnabled &&
    (props.spacing === undefined ||
      (typeof props.spacing === 'number' &&
        props.spacing in GAP_CLASS_BY_SPACING)) &&
    props.stackOn === undefined &&
    props.display === undefined;

  return canUseShadcn ? (
    <InlineShadcn ref={ref} {...props} />
  ) : (
    <InlineLegacy ref={ref} {...props} />
  );
});

Inline.displayName = 'Inline';

const inlinePropTypes = [
  'spacing',
  'alignItems',
  'alignSelf',
  'justifyContent',
  'stackOn',
];
const linkPropTypes = ['rel', 'target'];

const getInlineProps = (props: Record<string, any>) =>
  pickBy(props, (_value, key) => {
    if (key.startsWith('aria-') || key.startsWith('data-')) return true;
    const propTypes: string[] = [
      ...boxPropTypes,
      ...inlinePropTypes,
      ...linkPropTypes,
    ];
    return propTypes.includes(key);
  });

export { getInlineProps, Inline };
export type { Props as InlineProps };
