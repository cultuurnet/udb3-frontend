import { render } from '@testing-library/react';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/pages/_app' or its correspon... Remove this comment to see the full error message
import App from '@/pages/_app';

const renderPageWithWrapper = (Page) => render(Page, { wrapper: App });

export { renderPageWithWrapper };
