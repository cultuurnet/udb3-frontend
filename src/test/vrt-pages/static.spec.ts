import { screenshotPages } from './support';

screenshotPages([
  { title: 'copyright', path: '/copyright' },
  { title: 'unauthorized', path: '/unauthorized' },
  { title: '404', path: '/404', locator: (page) => page.locator('body') },
  { title: '500', path: '/500', locator: (page) => page.locator('body') },
  { title: 'login', path: '/login', locator: (page) => page.locator('body') },
]);
