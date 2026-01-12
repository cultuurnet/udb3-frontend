# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UiTdatabank Frontend is a **Next.js React TypeScript** application for cultural event management, built with **React Bootstrap** components and **styled-components**. The project is in active migration from a legacy AngularJS application to React, using a feature flag system for progressive rollout.

**Package Manager**: This project uses **Yarn**. Always use `yarn` commands instead of `npm`.

## Development Commands

```bash
# Install dependencies
yarn install

# Development server (localhost:3000)
yarn dev

# Production build
yarn build
yarn start

# Testing
yarn test:unit     # Jest unit tests
yarn test:e2e      # Playwright e2e tests

# Code quality
yarn lint          # ESLint with auto-fix
yarn lint:check    # ESLint check only
yarn format        # Prettier format
yarn format:check  # Prettier check only
yarn types:check   # TypeScript type checking
yarn ci            # Run all checks (types, lint, format)

# Storybook
yarn storybook
yarn storybook:build
```

## Environment Setup

- Copy `.env.example` to `.env.local` and fill in required values
- See sample config in [appconfig repo](https://github.com/cultuurnet/appconfig/blob/main/files/uitdatabank/docker/udb3-frontend/env)
- Node version defined in .nvmrc

## Architecture Patterns

### Hybrid React + AngularJS System

The application uses a **fallback pattern** where React pages progressively replace AngularJS routes:

1. React pages are defined in `src/pages/` with `.page.tsx` extension
2. Routes not handled by React fall back to the legacy AngularJS app via iframe (`src/pages/[...params].page.js`)
3. Communication between React and AngularJS happens via `useHandleWindowMessage()` hook

### Feature Flag Migration Pattern

**For migrating existing AngularJS routes:**

1. Add feature flag to `FeatureFlags` object in `src/hooks/useFeatureFlag.ts`
2. Add conditional redirect in `src/redirects.tsx` with `featureFlag` property
3. Use fallback pattern in the React page:

```typescript
import Fallback from '@/pages/[...params].page';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

const MyMigratedPage = () => {
  const [isFeatureFlagEnabled] = useFeatureFlag(FeatureFlags.MY_FEATURE);
  if (!isFeatureFlagEnabled) return <Fallback />;
  return <MyReactComponent />;
};
```

**For new React-only routes:**

- **DO NOT** use feature flags or `<Fallback>` for completely new routes that don't exist in AngularJS

**Testing feature flags:**
Access via browser console: `window.setFeatureFlag(FeatureFlags.REACT_CREATE, true)`

### API Integration Architecture

All API calls use **authenticated React Query hooks** that automatically handle token validation and redirect on 401/403:

```typescript
// Standard pattern for API hooks (src/hooks/api/entities.ts)
import {
  useAuthenticatedQuery,
  useAuthenticatedMutation,
} from '@/hooks/api/authenticated-query';
import { queryOptions } from '@tanstack/react-query';

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
```

**Mutation caching strategy:**

- Include `mutationKey` for duplicate prevention
- Invalidate queries on success: `queryClient.invalidateQueries({ queryKey: ['entities'] })`

### UI Component System

The project uses a **custom UI system** built on React Bootstrap with styled-components. See `src/ui/theme.ts` for centralized theme configuration.

**Always use custom UI components from `src/ui/` instead of raw Bootstrap:**

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

#### Layout System Architecture

- **Box**: Universal container with all CSS props (spacing, colors, positioning, flexbox)
  - Supports responsive values: `margin={{ default: 2, s: 1, m: 3 }}`
  - Hover states: `color={{ default: 'blue', hover: 'red' }}`
  - Spacing scale: 0-8 using powers of 2 (`padding={3}` = 0.533rem)
- **Stack**: Vertical layout with automatic spacing between children
- **Inline**: Horizontal layout with `stackOn` breakpoint for responsive stacking

### Form Architecture (React Hook Form + Yup)

**Standard form setup:**

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
  const { control, register, handleSubmit, formState, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', name: '', isVisible: true },
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync({ headers, ...data });
  };

  return (
    <Stack spacing={3}>
      <FormElement
        id="email"
        label={t('form.email.label')}
        Component={<Input {...register('email')} />}
        error={formState.errors.email?.message}
      />
      <Button
        disabled={!formState.isValid || !formState.isDirty}
        onClick={handleSubmit(onSubmit)}
      >
        {t('form.submit')}
      </Button>
    </Stack>
  );
};
```

#### Advanced Yup Validation Patterns

```typescript
const schema = yup.object({
  address: yup.object({
    streetAndNumber: yup.string(),
    city: yup
      .object({
        name: yup.string(),
        zip: yup.string(),
      })
      .when('country', {
        is: 'BE',
        then: yup.object({
          zip: yup.string().matches(/^\d{4}$/),
        }),
      }),
  }),

  name: yup
    .string()
    .required(t('form.errors.name_required'))
    .min(2, t('form.errors.name_min', { count: 2 }))
    .test(
      'no-semicolon',
      t('form.errors.semicolon'),
      (value) => !value || !/;/.test(value),
    ),

  contact: yup.array(
    yup.object({
      type: yup.string(),
      value: yup.string(),
    }),
  ),
});

const createValidationSchema = () => {
  const { t } = useTranslation();
  return yup.object({
    name: yup
      .string()
      .required(t('labels.form.errors.name_required'))
      .min(MIN_LENGTH, t('labels.form.errors.name_min', { count: MIN_LENGTH }))
      .max(MAX_LENGTH, t('labels.form.errors.name_max', { count: MAX_LENGTH })),
  });
};
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

### Internationalization (CRITICAL)

**All user-facing strings MUST be translatable** - stored in `src/i18n/`:

- **Supported languages**: Dutch (nl), French (fr), German (de)
- **Every new string requires translation in ALL three language files**

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = ({ userName, count }) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={3}>
      <Text>{t('form.title')}</Text>
      <Text>{t('welcome.message', { userName })}</Text>
      <Text>{t('items.count', { count })}</Text>
    </Stack>
  );
};
```

Translation file structure in `src/i18n/nl.json` (and fr.json, de.json):

```json
{
  "form": {
    "title": "Formulier titel",
    "submit": "Verzenden"
  },
  "welcome": {
    "message": "Welkom, {{userName}}!"
  }
}
```

### TypeScript Conventions

- **Prefer `const` over `enum`**: Use `const` objects with `as const`
- **Prefer `type` over `interface`**: Unless extending/implementing classes

```typescript
const MyConstants = { VALUE_A: 'a', VALUE_B: 'b' } as const;
type MyConstantType = Values<typeof MyConstants>;

type Address =
  | AddressInternal
  | Partial<Record<Values<typeof SupportedLanguages>, AddressInternal>>;
```

## File Organization

```
src/
├── pages/              # Next.js routes (*.page.tsx)
├── hooks/api/          # API hooks by entity (roles.ts, events.ts)
├── ui/                 # UI components with Storybook (*.stories.tsx)
├── types/              # Domain types and interfaces
├── constants/          # Application constants
├── i18n/               # Translation files (nl.json, fr.json, de.json)
├── test/
│   ├── e2e/            # Playwright e2e tests (*.spec.ts)
│   │   └── setup/      # Shared test setup
│   └── unit/           # Jest unit tests (*.test.ts)
├── redirects.tsx       # Feature flag redirects
└── middleware.api.ts   # Auth0 token handling
```

## Testing

### E2E Testing (Playwright)

- Location: `src/test/e2e/`
- Organized by domain (events/, manage/labels/, etc.)
- Separate setup for admin vs regular users (auth.setup.ts, auth-admin.setup.ts)
- Admin tests: `*.admin.spec.ts` files
- Run: `yarn test:e2e`

### Unit Testing (Jest)

- Uses Jest with React Testing Library
- SSR compatibility: Use `useIsClient()` hook for client-only code
- Run: `yarn test:unit`

## Key Integration Points

- **Authentication**: Auth0 with JWT tokens in cookies, `useHeaders()` for API auth, automatic 401/403 redirect via middleware
- **State Management**: React Query for server state, custom hooks for UI state, `useCookiesWithOptions()` for persistence
- **Window Communication**: `useHandleWindowMessage()` for AngularJS iframe integration
- **Client-Side Rendering**: `useIsClient()` for SSR compatibility, `useMatchBreakpoint()` for responsive behavior
- **Error Handling**: Sentry integration, custom `FetchError` class, global error boundaries
- **Responsive Breakpoints**: Use `useMatchBreakpoint()` from theme breakpoints

## Code Style

- No unnecessary comments (code should be self-explanatory)
- No emojis in user-facing text unless explicitly requested
- Remove unused code completely (no backwards-compatibility hacks)
- Avoid over-engineering: make only necessary changes
- Prefer simple solutions over abstractions
