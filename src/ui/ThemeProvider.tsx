// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'styl... Remove this comment to see the full error message
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { theme } from './theme';

const ThemeProvider = (props) => {
  return <SCThemeProvider theme={theme} {...props} />;
};

export { ThemeProvider };
