import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { Theme, theme } from './theme';

const ThemeProvider = (props: { theme: Theme }) => {
  return <SCThemeProvider theme={theme} {...props} />;
};

export { ThemeProvider };
