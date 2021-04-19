// we can only import global css from _app in /pages
import '@/styles/global.scss';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/pages/_app' or its correspon... Remove this comment to see the full error message
export { default } from '@/pages/_app';
