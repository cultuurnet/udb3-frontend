import type { ReactElement, ReactNode, Ref } from 'react';
import { cloneElement } from 'react';

import type { Values } from '@/types/Values';
import { parseSpacing } from '@/ui/Box';
import { cn } from '@/ui/shadcn/utils';

import { getInlineProps, Inline, InlineProps } from './Inline';
import { Label, LabelPositions, LabelVariants } from './Label';
import { Spinner, SpinnerSizes } from './Spinner';
import type { StackProps } from './Stack';
import { getStackProps, Stack } from './Stack';
import { Text, TextVariants } from './Text';

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
} & StackProps;

const MaxLengthCounter = ({
  currentLength,
  maxLength,
}: {
  currentLength: number;
  maxLength: number;
}) => (
  <Text
    variant={TextVariants.MUTED}
    fontSize="0.9rem"
    className="text-right"
    maxWidth="43rem"
    color={currentLength >= maxLength ? 'red' : 'inherit'}
  >
    {currentLength} / {maxLength}
  </Text>
);

const FormElement = ({
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
  ...props
}: Props) => {
  const Wrapper = labelPosition === LabelPositions.TOP ? Stack : Inline;

  // @ts-expect-error
  const clonedComponent = cloneElement(Component, {
    // @ts-expect-error
    ...Component.props,
    id,
    ref,
    maxLength,
  });

  const currentLength = clonedComponent.props?.value?.length ?? 0;
  const wrapperProps: { [key: string]: InlineProps | StackProps } = {
    [LabelPositions.TOP]: {
      alignItems: 'flex-start',
      spacing: 2,
      ...getStackProps(props),
    },
    [LabelPositions.LEFT]: {
      alignItems: 'center',
      spacing: 0,
      ...getInlineProps(props),
    },
    [LabelPositions.RIGHT]: {
      alignItems: 'center',
      flexDirection: 'row-reverse',
      justifyContent: 'flex-end',
      spacing: 0,
      ...getInlineProps(props),
    },
  };

  const infoElement =
    typeof info === 'string' ? (
      <Text
        variant={TextVariants.MUTED}
        dangerouslySetInnerHTML={{ __html: info }}
        maxWidth={parseSpacing(9)}
        css={`
          strong {
            font-weight: bold;
          }
        `}
      />
    ) : (
      info
    );

  const labelElement = (
    <Label
      variant={labelVariant}
      htmlFor={id}
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
    <Wrapper
      as="div"
      className={cn(
        className,
        labelPosition !== LabelPositions.TOP && 'tw:gap-2',
      )}
      {...(wrapperProps[labelPosition] ?? {})}
    >
      {label && labelPosition !== LabelPositions.TOP && labelElement}
      <Stack
        as="div"
        spacing={3}
        width={labelPosition === LabelPositions.RIGHT ? 'auto' : '100%'}
        minWidth={50}
      >
        {((label && labelPosition === LabelPositions.TOP) ||
          typeof maxLength !== 'undefined') && (
          <Inline justifyContent="space-between" maxWidth="43rem">
            <span>
              {label && labelPosition === LabelPositions.TOP && labelElement}
            </span>
            {typeof maxLength !== 'undefined' && (
              <MaxLengthCounter
                currentLength={currentLength}
                maxLength={maxLength}
              />
            )}
          </Inline>
        )}
        <Stack as="div">
          <Inline as="div" alignItems="center">
            {clonedComponent}
            {loading && (
              <Spinner size={SpinnerSizes.SMALL} className="tw:w-auto tw:p-3" />
            )}
          </Inline>
          {error && <Text variant={TextVariants.ERROR}>{error}</Text>}
        </Stack>
        {info && infoElement}
      </Stack>
    </Wrapper>
  );
};

export { FormElement };
