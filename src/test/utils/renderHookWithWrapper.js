import { renderHook } from '@testing-library/react-hooks';
import Cookies from 'universal-cookie'

import App from '@/pages/_app.page';

const renderHookWithWrapper = (hook) => renderHook(hook, {
    wrapper: (props) =>
        App({ ...props, Component: { universalCookies: new Cookies() } }),
});

export { renderHookWithWrapper };
