# UiTdatabank Frontend - AI Development Guide

## Architecture Overview

This is a **Next.js React TypeScript application** for UiTdatabank (cultural event management) built with **React Bootstrap components** and a feature flag system for progressive migration from AngularJS.

### Key Architectural Patterns

- **React + Bootstrap UI**: All components use **React Bootstrap** as the foundation, wrapped in custom components with **styled-components** for theming
- **Authenticated API Layer**: All API calls use `useAuthenticatedQuery`/`useAuthenticatedMutation` from `@tanstack/react-query` with automatic token validation and redirect on 401/403
- **Feature Flag System**: Progressive rollout of React features controlled via cookies (`src/hooks/useFeatureFlag.ts`) and redirect rules (`src/redirects.tsx`)
- **Fallback Pattern**: Legacy AngularJS app embedded via iframe in `[...params].page.js` for routes not yet migrated to React
- **Custom UI System**: React components extending Bootstrap with styled-components, centralized theme in `src/ui/theme.ts`

## Critical Development Workflows

### API Integration

```typescript
import {
  useAuthenticatedQuery,
  useAuthenticatedMutation,
} from '@/hooks/api/authenticated-query';

const createGetRolesQueryOptions = ({ name, paginationOptions }) =>
  queryOptions({
    queryKey: ['roles'],
    queryFn: getRoles,
    queryArguments: { name, paginationOptions },
  });

const useGetRolesQuery = (args, config = {}) =>
  useAuthenticatedQuery({ ...createGetRolesQueryOptions(args), ...config });

const useCreateRoleMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: createRole,
    mutationKey: 'roles-create',
    ...configuration,
  });

const prefetchGetRolesQuery = ({ req, queryClient, ...args }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetRolesQueryOptions(args),
  });

export { useGetRolesQuery, useCreateRoleMutation, prefetchGetRolesQuery };
```

### Feature Flag Implementation

#### For Migrating Existing AngularJS Routes to React:

1. Add flag to `FeatureFlags` object in `src/hooks/useFeatureFlag.ts`
2. Add conditional redirect in `src/redirects.tsx` with `featureFlag` property
3. Use fallback pattern for progressive migration:

```typescript
import Fallback from '@/pages/[...params].page';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

const MyMigratedPage = () => {
  const [isFeatureFlagEnabled] = useFeatureFlag(FeatureFlags.MY_FEATURE);

  if (!isFeatureFlagEnabled) return <Fallback />;

  return <MyReactComponent />;
};
```

#### For New React-Only Routes:

- **DO NOT use feature flags or `<Fallback>`** for completely new routes
- New routes that don't exist in AngularJS should render React components directly
- Only use fallback pattern when migrating existing AngularJS functionality

### UI Component Creation (Custom UI Components First)

```typescript
import { Button } from '@/ui/Button';
import { Box, Stack, Inline } from '@/ui/';
import { Modal } from '@/ui/Modal';
import { Table } from '@/ui/Table';

const MyComponent = ({ children, ...props }) => (
  <Box
    padding={3}
    marginY={2}
    backgroundColor="primary"
    {...props}
  >
    {children}
  </Box>
);

const MyForm = () => (
  <Stack spacing={3}>
    <TextField />
    <Button />
  </Stack>
);

const ButtonGroup = () => (
  <Inline spacing={2} stackOn="s">
    <Button>Save</Button>
    <Button>Cancel</Button>
  </Inline>
);
```

## Project-Specific Conventions

### Layout System Architecture

- **Box**: Universal container with all CSS props (spacing, colors, positioning, flexbox)
  - Supports responsive values: `margin={{ default: 2, s: 1, m: 3 }}`
  - Hover states: `color={{ default: 'blue', hover: 'red' }}`
  - Spacing scale: 0-8 using powers of 2 (`padding={3}` = 0.533rem)
- **Stack**: Vertical layout with automatic spacing between children
- **Inline**: Horizontal layout with `stackOn` breakpoint for responsive stacking

### File Organization

- **Pages**: `src/pages/` with `.page.tsx` extension for Next.js routing
- **API Hooks**: `src/hooks/api/` with pattern `entities.ts` (roles.ts, events.ts)
- **UI Components**: `src/ui/` with corresponding `.stories.tsx` for Storybook
- **Types**: Domain types in `src/types/`, constants in `src/constants/`
- **Translations**: All user-facing strings in `src/i18n/` (nl.json, fr.json, de.json)

### Type Patterns

```typescript
const MyConstants = { VALUE_A: 'a', VALUE_B: 'b' } as const;
type MyConstantType = Values<typeof MyConstants>;

const isEvent = (value: unknown): value is Event =>
  typeof value?.['@context'] === 'string' &&
  value['@context'].endsWith('/event');

type Address =
  | AddressInternal
  | Partial<Record<Values<typeof SupportedLanguages>, AddressInternal>>;

type BaseOffer = {
  '@id': string;
  name: Partial<Record<Values<typeof SupportedLanguages>, string>>;
  workflowStatus: WorkflowStatus;
};
```

### Mutation Caching Strategy

- Mutations include `mutationKey` for duplicate prevention
- Disabled for specific operations: `'offers-add-price-info'`, `'places-add'`, etc.
- Query invalidation on success: `queryClient.invalidateQueries({ queryKey: ['entities'] })`

## Package Management

**IMPORTANT**: This project uses **Yarn** as the package manager. Always use `yarn` commands instead of `npm`:

- Use `yarn install` instead of `npm install`
- Use `yarn add <package>` instead of `npm install <package>`
- Use `yarn dev` instead of `npm run dev`
- Use `yarn build` instead of `npm run build`

## Build & Development Commands

```bash
yarn dev
yarn dev:vagrant
yarn build
yarn start
yarn test:unit
yarn test:e2e
yarn ci
yarn lint
yarn format
yarn storybook
yarn storybook:build
```

## Environment & Configuration

- **Environment Variables**: Copy `.env.example` to `.env.local`
- **Feature Flags**: Access via browser console: `window.setFeatureFlag(FeatureFlags.REACT_CREATE, true)`
- **Auth Flow**: Auth0 integration with middleware handling token management in `src/middleware.api.ts`
- **Legacy Integration**: Routes not in React fall back to AngularJS iframe via `[...params].page.js`

### Form Patterns (React Hook Form + Yup Validation)

#### Standard Form Setup with Yup Schema

```typescript
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required(),
  isVisible: yup.boolean().default(true),
});

type FormData = yup.InferType<typeof schema>;

const MyForm = () => {
  const { t } = useTranslation();

  const { control, register, handleSubmit, formState, watch } =
    useForm<FormData>({
      resolver: yupResolver(schema),
      defaultValues: { email: '', name: '', isVisible: true },
      mode: 'onChange',
    });

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync({ headers, ...data });
  };
};
```

#### Advanced Yup Validation Patterns

```typescript
const schema = yup.object({
  address: yup.object({
    streetAndNumber: yup.string(),
    city: yup.object({
      name: yup.string(),
      zip: yup.string(),
    }).when('country', {
      is: 'BE',
      then: yup.object({
        zip: yup.string().matches(/^\d{4}$/),
      }),
    }),
  }),

  name: yup.string()
    .required(t('form.errors.name_required'))
    .min(2, t('form.errors.name_min', { count: 2 }))
    .test('no-semicolon', t('form.errors.semicolon'),
      (value) => !value || !/;/.test(value)
    ),

  contact: yup.array(yup.object({
    type: yup.string(),
    value: yup.string()
  })),
});

const createValidationSchema = () => {
  const { t } = useTranslation();
  return yup.object({
    name: yup.string()
      .required(t('labels.form.errors.name_required'))
      .min(MIN_LENGTH, t('labels.form.errors.name_min', { count: MIN_LENGTH }))
      .max(MAX_LENGTH, t('labels.form.errors.name_max', { count: MAX_LENGTH })),
  });
};

const createValidationSchema = () => {
```

#### Form Components Integration

```typescript
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { Button } from '@/ui/Button';
const { control, register, handleSubmit, formState, watch } = useForm({
  resolver: yupResolver(validationSchema),
  defaultValues: { name: '', isVisible: true },
  mode: 'onChange',
});

const onSubmit = async (data) => {
  await createMutation.mutateAsync({ headers, ...data });
};

<FormElement
  id="email"
  label={t('form.email.label')}
  Component={
    <Input
      {...register('email')}
      placeholder={t('form.email.placeholder')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && formState.isValid) {
          handleSubmit(onSubmit)();
        }
      }}
    />
  }
  error={formState.errors.email?.message}
/>

<Controller
  name="name"
  control={control}
  render={({ field }) => (
    <FormElement
      id="name"
      label={t('form.name')}
      error={formState.errors.name?.message}
      Component={<Input {...field} />
      />
    )}
  />

<Controller
  name="isVisible"
  control={control}
  render={({ field }) => (
    <CheckboxWithLabel
      id="visible"
      checked={field.value}
      onToggle={(e) => field.onChange(e.currentTarget.checked)}
    >
      {t('form.visible')}
    </CheckboxWithLabel>
  )}
/>

<Button
  disabled={!formState.isValid || !formState.isDirty}
  onClick={handleSubmit(onSubmit)}
>
  {t('form.submit')}
</Button>
```

#### Form Validation Best Practices

- **Always use yup schemas**: Never rely on HTML validation alone
- **Type inference**: Use `yup.InferType<typeof schema>` for FormData types
- **Translation integration**: Create schema functions that use `useTranslation()` for dynamic error messages
- **Real-time validation**: Set `mode: 'onChange'` for immediate feedback
- **Prefer register()**: Use `register()` for simple inputs, `Controller` for complex components
- **Event handlers**: Prefer `onClick` for buttons and `onChange` for inputs over `onKeyDown`
- **Validation states**: Use `formState.isValid`, `formState.isDirty` for button states
- **No `<form>` tags**: Use `handleSubmit(onSubmit)` on Button `onClick` instead of form submission
- **No comments**: Code should be self-explanatory without inline comments

### Custom Hooks Architecture

```typescript
import { useCallback, useEffect, useState } from 'react';
import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsClient } from '@/hooks/useIsClient';

const useFeatureFlag = (flagName) => {
  const { cookies, setCookie } = useCookiesWithOptions([`ff_${flagName}`]);
  const [isEnabled, setIsEnabled] = useState(
    cookies[`ff_${flagName}`] === 'true',
  );
  return [isEnabled, setIsEnabled];
};

const useMatchBreakpoint = (breakpoint) => {
  const [matches, setMatches] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient || !breakpoint) return;
    const mediaQuery = window.matchMedia(
      `(max-width: ${theme.breakpoints[breakpoint]}px)`,
    );
    const handleChange = ({ matches }) => setMatches(matches);
    mediaQuery.addEventListener('change', handleChange);
    handleChange(mediaQuery);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint, isClient]);

  return matches;
};

const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

## Key Integration Points

- **Authentication**: JWT tokens in cookies, `useHeaders()` for API auth, automatic 401/403 redirect
- **Feature Flags**: `useFeatureFlag()` with cookie-based state, browser console access for testing
- **Forms**: React Hook Form with Controller + FormElement, no `<form>` tags, action handlers on buttons
- **Client-Side Rendering**: `useIsClient()` for SSR compatibility, `useMatchBreakpoint()` for responsive behavior
- **State Management**: React Query for server state, custom hooks for UI state, `useCookiesWithOptions()` for persistence
- **Window Communication**: `useHandleWindowMessage()` for legacy AngularJS iframe integration
- **i18n**: React-i18next with language files in `src/i18n/` - **ALL user-facing strings must be translatable**
- **Error Handling**: Sentry integration, custom `FetchError` class, global error boundaries
- **Testing**: Jest + React Testing Library for unit tests, Playwright for e2e

## Internationalization Requirements

**CRITICAL**: All user-facing strings must be translatable and stored in `src/i18n/` language files.

### Translation Implementation

- **Supported Languages**: Dutch (nl), French (fr), German (de) - fallback to Dutch
- **Hook Usage**: Import `useTranslation` from `react-i18next`, use `t('translation.key')`
- **Translation Keys**: Nested JSON structure with descriptive keys (e.g., `form.name`, `actions.save`)
- **Complete Coverage**: Every new string requires translation in ALL three language files
- **Placeholders**: Use `{{placeholder}}` syntax for dynamic values in translations

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = ({ userName, count }) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={3}>
      <Text>{t('form.title')}</Text>
      <Button>{t('actions.save')}</Button>
      <Text>{t('validation.required')}</Text>
      <Text>{t('welcome.message', { userName })}</Text>
      <Text>{t('items.count', { count })}</Text>
      <Text
        dangerouslySetInnerHTML={{
          __html: t('content.with_html'),
        }}
      />
      <!--
      Only use 'dangerouslySetInnerHTML' with content that is guaranteed safe (e.g., static translations), never with user input or untrusted data.
      -->
    </Stack>
  );
};
```

### Translation File Structure

Add to `src/i18n/nl.json`, `src/i18n/fr.json`, `src/i18n/de.json`:

```json
{
  "form": {
    "title": "Formulier titel",
    "name": "Naam",
    "submit": "Verzenden"
  },
  "actions": {
    "save": "Bewaren",
    "cancel": "Annuleren",
    "edit": "Bewerken"
  },
  "validation": {
    "required": "Dit veld is verplicht",
    "invalid_email": "Ongeldig e-mailadres"
  },
  "welcome": {
    "message": "Welkom, {{userName}}!"
  },
  "items": {
    "count": "Je hebt {{count}} item",
    "count_plural": "Je hebt {{count}} items"
  },
  "content": {
    "with_html": "Dit is <strong>belangrijke</strong> tekst met <a href='#'>een link</a>"
  }
}
```

Always check existing patterns in similar files before creating new API hooks, UI components, or pages.
