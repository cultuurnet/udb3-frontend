import type { ChangeEvent } from 'react';
import { forwardRef } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Textarea as ShadcnTextarea } from '@/ui/shadcn/textarea';

import { cn } from './shadcn/utils';
import { TextAreaLegacy } from './TextAreaLegacy';

type TextAreaProps = {
  id?: string;
  name?: string;
  value?: string;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onInput?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
};

type Props = TextAreaProps;

const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      id,
      className,
      onInput,
      value,
      disabled = false,
      rows = 3,
      placeholder,
      required = false,
      onChange,
      onBlur,
      name,
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const [isShadcnMigrationEnabled] = useFeatureFlag(
      FeatureFlags.SHADCN_MIGRATION,
    );

    if (isShadcnMigrationEnabled) {
      return (
        <ShadcnTextarea
          id={id}
          className={cn('tw:min-h-16 tw:md:text-base', className)}
          onInput={onInput}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          required={required}
          ref={ref}
          name={name}
          aria-label={ariaLabel}
        />
      );
    }

    return (
      <TextAreaLegacy
        id={id}
        className={className}
        onInput={onInput}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        required={required}
        ref={ref}
        name={name}
        aria-label={ariaLabel}
      />
    );
  },
);

TextArea.displayName = 'TextArea';

export { TextArea };
export type { TextAreaProps };
