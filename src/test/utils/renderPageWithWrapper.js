import { render } from '@testing-library/react';
import Cookies from 'universal-cookie';

import App from '@/pages/_app.page';

const renderPageWithWrapper = (Page) =>
  render(Page, {
    wrapper: (props) =>
      App({ ...props, Component: { universalCookies: new Cookies() } }),
  });

export { renderPageWithWrapper };
