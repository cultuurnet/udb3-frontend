# udb3-frontend

## Environment Variables

Copy the `.env.example` and rename it to `.env.local`.
Fill in the correct values for the variables.
For running it in combination with [udb3-backend](https://github.com/cultuurnet/udb3-backend) on [Docker](https://www.docker.com),
a sample `env` (rename it to `.env`) is available in [appconfig](https://github.com/cultuurnet/appconfig/blob/main/files/uitdatabank/docker/udb3-frontend/env).

## Build Setup

```bash
# install dependencies
$ yarn

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start
```

For detailed explanation on how things work, check out [Next.js docs](https://nextjs.org/docs/getting-started).

## Storybook

```bash
$ yarn storybook
```

## Feature Flags

After development new features might have to remain hidden for some users. This can be done with feature flags.

1. Add a new feature flag to `src/hooks/useFeatureFlag.ts`
2. If the new feature has a new path that replaces an old path, add a feature flag controlled redirect to `src/redirects.tsx`

```
{
  source: '/manage/labels/:labelId',
  destination: '/manage/labels/:labelId/edit',
  permanent: false,
  featureFlag: FeatureFlags.REACT_LABELS_CREATE_EDIT,
},
```

3. If the new feature is on the same path as the old version it might be necessary to include a fallback in the new page:

```
  import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
  import Fallback from '@/pages/[...params].page';

  const [isReactLabelsCreateEditFeatureFlagEnabled] = useFeatureFlag(
    FeatureFlags.REACT_LABELS_CREATE_EDIT,
  );

  if (!isReactLabelsCreateEditFeatureFlagEnabled) return <Fallback />;

```

4. Create a ticket to remove the feature flag code when it is no longer needed. Describing the places it is used.
