import { fillAndWaitForText } from './interactions';
import { screenshotPages } from './support';

const SEARCH_PLACEHOLDER = 'Schrijf een zoekopdracht van minstens 2 karakters.';

screenshotPages([
  { title: 'labels create', path: '/manage/labels/create' },
  { title: 'labels overview', path: '/manage/labels' },
  { title: 'labels edit', path: '/manage/labels/vrt-mock-label-1/edit' },
  {
    title: 'labels search results',
    path: '/manage/labels',
    beforeScreenshot: fillAndWaitForText(
      SEARCH_PLACEHOLDER,
      'verborgen',
      'VRT mock label — verborgen',
    ),
  },
  {
    title: 'labels no results',
    path: '/manage/labels',
    beforeScreenshot: fillAndWaitForText(
      SEARCH_PLACEHOLDER,
      'geen-resultaten-mock',
      'Geen labels gevonden.',
    ),
  },
]);
