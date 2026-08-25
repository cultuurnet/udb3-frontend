import type { ReactElement, ReactNode, Ref } from 'react';
import { cloneElement } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

import { FormElementLegacy } from './FormElementLegacy';
import { Label, LabelPositions, LabelVariants } from './Label';
import { Spinner, SpinnerSizes } from './Spinner';
import { Text } from './Text';

type Props = {
  id: string;
  ref?: Ref<HTMLElement>;
  label?: ReactNode;
  labelPosition?: Values<typeof LabelPositions>;
  labelVariant?: Values<typeof LabelVariants>;
  error?: ReactElement | string;
  info?: ReactNode;
  loading?: boolean;
  maxLength?: number;
  Component: ReactNode;
  className?: string;
};

const GAP_CLASS_BY_LABEL_POSITION: Record<
  Values<typeof LabelPositions>,
  string
> = {
  [LabelPositions.TOP]: 'tw:flex-col tw:items-start tw:gap-1',
  [LabelPositions.LEFT]: 'tw:flex-row tw:items-center tw:gap-2',
  [LabelPositions.RIGHT]:
    'tw:flex-row-reverse tw:justify-end tw:items-center tw:gap-2',
};

const MaxLengthCounterShadcn = ({
  currentLength,
  maxLength,
}: {
  currentLength: number;
  maxLength: number;
}) => (
  <Text
    className={cn(
      'tw:max-w-lg tw:text-right tw:text-sm',
      currentLength >= maxLength
        ? 'tw:text-destructive'
        : 'tw:text-muted-foreground',
    )}
  >
    {currentLength} / {maxLength}
  </Text>
);

const FormElementShadcn = ({
  id,
  ref,
  label,
  labelPosition = LabelPositions.TOP,
  labelVariant = LabelVariants.BOLD,
  error,
  info,
  loading = false,
  Component,
  className,
  maxLength,
}: Props) => {
  // @ts-expect-error
  const isDisabled = Component.props?.disabled;

  // @ts-expect-error
  const clonedComponent = cloneElement(Component, {
    // @ts-expect-error
    ...Component.props,
    id,
    ref,
    maxLength,
    ...(error && { isInvalid: true }),
  });

  const currentLength = clonedComponent.props?.value?.length ?? 0;

  const infoElement =
    typeof info === 'string' ? (
      <Text
        className="tw:max-w-lg tw:text-muted-foreground tw:[&_strong]:font-bold"
        dangerouslySetInnerHTML={{ __html: info }}
      />
    ) : (
      info
    );

  const labelElement = (
    <Label
      variant={labelVariant}
      htmlFor={id}
      disabled={isDisabled}
      className={cn(
        'tw:shrink-0',
        labelPosition !== LabelPositions.TOP &&
          'tw:flex tw:h-9 tw:items-center',
      )}
    >
      {label}
    </Label>
  );

  return (
    <div
      className={cn(
        'tw:flex',
        GAP_CLASS_BY_LABEL_POSITION[labelPosition],
        className,
      )}
    >
      {label && labelPosition !== LabelPositions.TOP && labelElement}
      <div
        className={cn(
          'tw:flex tw:flex-col tw:gap-2',
          labelPosition === LabelPositions.RIGHT ? 'tw:w-auto' : 'tw:w-full',
        )}
      >
        {((label && labelPosition === LabelPositions.TOP) ||
          typeof maxLength !== 'undefined') && (
          <div className="tw:flex tw:justify-between tw:max-w-172">
            <span>
              {label && labelPosition === LabelPositions.TOP && labelElement}
            </span>
            {typeof maxLength !== 'undefined' && (
              <MaxLengthCounterShadcn
                currentLength={currentLength}
                maxLength={maxLength}
              />
            )}
          </div>
        )}
        <div className="tw:flex tw:flex-col">
          <div className="tw:flex tw:items-center">
            {clonedComponent}
            {loading && (
              <Spinner size={SpinnerSizes.SMALL} className="tw:w-auto tw:p-3" />
            )}
          </div>
          {error && <Text className="tw:text-destructive">{error}</Text>}
        </div>
        {info && infoElement}
      </div>
    </div>
  );
};

const FormElement = (props: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <FormElementShadcn {...props} />;
  }

  return <FormElementLegacy {...props} />;
};

export { FormElement };
export type { Props as FormElementProps };
