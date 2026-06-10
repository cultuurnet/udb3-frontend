// Gap classes mirror Box's parseSpacing scale (2^n / 15 rem) so the Tailwind
// flex+gap version stays pixel-equivalent to the legacy margin spacing.
// The strings must stay static literals so Tailwind can extract them.
const GAP_CLASS_BY_SPACING: Record<number, string> = {
  0: 'tw:gap-0',
  1: 'tw:gap-[0.1333rem]',
  2: 'tw:gap-[0.2667rem]',
  3: 'tw:gap-[0.5333rem]',
  4: 'tw:gap-[1.0667rem]',
  5: 'tw:gap-[2.1333rem]',
  6: 'tw:gap-[4.2667rem]',
  7: 'tw:gap-[8.5333rem]',
  8: 'tw:gap-[17.0667rem]',
};

const getGapClass = (spacing?: number): string =>
  spacing === undefined ? '' : (GAP_CLASS_BY_SPACING[spacing] ?? '');

export { getGapClass };
