import type {
  FieldError,
  FormState,
  Path,
  UseFormReturn,
} from 'react-hook-form';

import type { BoxProps } from '@/ui/Box';
import { Box } from '@/ui/Box';
import type { StackProps } from '@/ui/Stack';
import { getStackProps, Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

import type { FormData as EventFormData } from './create/EventForm';
import type { FormData as MovieFormData } from './manage/movies/MovieForm';

type GeneralFormData = MovieFormData | EventFormData;

type StepsConfiguration<TFormData extends GeneralFormData> = Array<{
  Component: any;
  field?: Path<TFormData>;
  step?: number;
  title: string;
  shouldShowNextStep?: boolean;
  additionalProps?: { [key: string]: unknown };
}>;

type NumberIndicatorProps = {
  children: number;
} & BoxProps;

const NumberIndicator = ({ children, ...props }: NumberIndicatorProps) => {
  return (
    <Box
      borderRadius="50%"
      width="1.8rem"
      height="1.8rem"
      lineHeight="1.8rem"
      backgroundColor={getValue('stepNumber.backgroundColor')}
      padding={0}
      fontSize="1rem"
      fontWeight="bold"
      color="white"
      textAlign="center"
      {...props}
    >
      {children}
    </Box>
  );
};

type StepWrapperProps = StackProps & { title: string; stepNumber: number };

const StepWrapper = ({
  stepNumber,
  children,
  title,
  ...props
}: StepWrapperProps) => {
  return (
    <Stack spacing={4} width="100%" {...getStackProps(props)}>
      <Title
        color={getValue('title.color')}
        lineHeight="220%"
        alignItems="center"
        spacing={3}
        css={`
          border-bottom: 1px solid ${getValue('title.borderColor')};
        `}
      >
        <NumberIndicator>{stepNumber}</NumberIndicator>
        <Text>{title}</Text>
      </Title>
      {children}
    </Stack>
  );
};

StepWrapper.defaultProps = {
  title: '',
};

const getValue = getValueFromTheme('moviesCreatePage');

type KeepStateOptions = {
  keepErrors: boolean;
  keepDirty: boolean;
  keepValues: boolean;
  keepDefaultValues: boolean;
  keepIsSubmitted: boolean;
  keepTouched: boolean;
  keepIsValid: boolean;
  keepSubmitCount: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line no-unused-vars
type ResetFunction<TFormData extends GeneralFormData> = (
  values?: any,
  keepStateOptions?: Partial<KeepStateOptions>,
) => void;

type StepProps<TFormData extends GeneralFormData> = Omit<
  UseFormReturn<TFormData>,
  'formState' | 'reset'
> & {
  reset: ResetFunction<TFormData>;
  formState: Omit<FormState<TFormData>, 'errors'> & {
    // TODO: make keyof TFormData work
    errors: Record<string, FieldError>;
  };
} & {
  loading: boolean;
  field: Path<TFormData>;
  onChange: (value: any) => void;
};

type StepsProps<
  TFormData extends GeneralFormData
> = UseFormReturn<TFormData> & {
  mode: 'UPDATE' | 'CREATE';
  fieldLoading?: string;
  onChange?: (value: string, field: string) => void;
  configuration: StepsConfiguration<TFormData>;
};

const Steps = <TFormData extends GeneralFormData>({
  mode,
  onChange,
  configuration,
  fieldLoading,
  ...props
}: StepsProps<TFormData>) => {
  const keys = Object.keys(props.getValues());

  return (
    <Stack spacing={5}>
      {configuration.map(
        (
          { Component: Step, field, additionalProps = {}, step, title },
          index: number,
        ) => {
          const shouldShowNextStep =
            configuration[index - 1]?.shouldShowNextStep ?? true;

          if (
            !keys.includes(field) &&
            !shouldShowNextStep &&
            mode !== 'UPDATE'
          ) {
            return null;
          }

          const stepNumber = step ?? index + 1;

          return (
            <StepWrapper
              stepNumber={stepNumber}
              key={`step${stepNumber}`}
              title={title}
            >
              <Step<TFormData>
                key={index}
                onChange={(value) => onChange(field, value)}
                loading={!!(field && fieldLoading === field)}
                field={field}
                {...props}
                {...additionalProps}
              />
            </StepWrapper>
          );
        },
      )}
    </Stack>
  );
};

Steps.defaultProps = {
  mode: 'CREATE',
  onChange: () => {},
  fieldLoading: '',
};

export { Steps };
export type { GeneralFormData, StepProps, StepsConfiguration };
