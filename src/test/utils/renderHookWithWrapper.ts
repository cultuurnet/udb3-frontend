import { renderHook } from '@testing-library/react-hooks';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/pages/_app' or its correspon... Remove this comment to see the full error message
import App from '@/pages/_app';

const renderHookWithWrapper = (hook) => renderHook(hook, { wrapper: App });

export { renderHookWithWrapper };
