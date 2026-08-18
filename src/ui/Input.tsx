import type {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  KeyboardEvent,
} from 'react';
import { forwardRef } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { cn } from '@/ui/shadcn/utils';

import { InputLegacy } from './InputLegacy';
import { Input as ShadcnInput } from './shadcn/input';

type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'numeric'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

type InputProps = {
  id?: string;
  name?: string;
  className?: string;
  type?: InputType;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  maxLength?: number;
  accept?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
};

const InputShadcn = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', isInvalid = false, ...props }, ref) => (
    <ShadcnInput
      ref={ref}
      {...props}
      type={type}
      aria-invalid={isInvalid}
      className={cn(
        'tw:max-w-172',
        isInvalid && 'tw:border-destructive tw:focus-visible:ring-destructive',
        className,
      )}
    />
  ),
);

InputShadcn.displayName = 'InputShadcn';

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (isShadcnMigrationEnabled) {
    return <InputShadcn {...props} ref={ref} />;
  }

  return <InputLegacy {...props} ref={ref} />;
});

Input.displayName = 'Input';

export { Input };
export type { InputProps, InputType };
