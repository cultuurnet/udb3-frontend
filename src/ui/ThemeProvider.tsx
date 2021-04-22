import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { Theme, theme as themeFallback } from './theme';

const ThemeProvider = (props: { theme: Theme }) => {
  return <SCThemeProvider {...props} theme={props.theme ?? themeFallback} />;
};

export { ThemeProvider };
