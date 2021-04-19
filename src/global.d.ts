import { CSSProp } from 'styled-components';
declare module 'react' {
  interface Attributes {
    className?: string;
    forwardedAs?: string | React.ReactNode;
    css?: CSSProp;
  }
}
