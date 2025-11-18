# UiTdatabank Frontend - AI Development Guide

## Architecture Overview

This is a **Next.js React TypeScript application** for UiTdatabank (cultural event management) built with **React Bootstrap components** and a sophisticated feature flag system for progressive migration from AngularJS.

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

1. Add flag to `FeatureFlags` object in `src/hooks/useFeatureFlag.ts`
2. Add conditional redirect in `src/redirects.tsx` with `featureFlag` property
3. Use fallback pattern: `if (!featureFlagEnabled) return <Fallback />;`

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

- **Pages**: `src/pages/` with `.page.js` extension for Next.js routing
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

## Build & Development Commands

```bash
# Development with hot reload
yarn dev

# For Vagrant environment (with SSL certs)
yarn dev:vagrant

# Build for production and launch server
yarn build
yarn start

# Testing
yarn test:unit          # Jest unit tests
yarn test:e2e          # Playwright e2e tests

# Code quality
yarn ci                # Types + lint + format check
yarn lint              # ESLint with auto-fix
yarn format            # Prettier formatting

# Storybook for UI components
yarn storybook
yarn storybook:build
```

## Environment & Configuration

- **Environment Variables**: Copy `.env.example` to `.env.local`
- **Feature Flags**: Access via browser console: `window.setFeatureFlag(FeatureFlags.REACT_CREATE, true)`
- **Auth Flow**: Auth0 integration with middleware handling token management in `src/middleware.api.ts`
- **Legacy Integration**: Routes not in React fall back to AngularJS iframe via `[...params].page.js`

### Form Patterns (React Hook Form + Custom Components)

```typescript
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { Button } from '@/ui/Button';

const { control, handleSubmit, formState, watch } = useForm({
  resolver: yupResolver(validationSchema),
  defaultValues: { name: '', isVisible: true },
  mode: 'onChange',
});

const onSubmit = async (data) => {
  await createMutation.mutateAsync({ headers, ...data });
};

<Stack spacing={3}>
  <Controller
    name="name"
    control={control}
    render={({ field }) => (
      <FormElement
        id="name"
        label={t('form.name')}
        error={formState.errors.name?.message}
        Component={<Input {...field} />}
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
    disabled={!formState.isValid}
    onClick={handleSubmit(onSubmit)}
  >
    {t('form.submit')}
  </Button>
</Stack>
```

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

````typescript
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
    </Stack>
  );
};
```### Translation File Structure

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
````

Always check existing patterns in similar files before creating new API hooks, UI components, or pages.
