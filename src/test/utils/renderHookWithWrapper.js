import { renderHook } from '@testing-library/react';

import App from '@/pages/_app.page';

const renderHookWithWrapper = (hook) => renderHook(hook, { wrapper: App });

export { renderHookWithWrapper };
