import { Canvas } from '@storybook/addon-docs/blocks';
import styled from 'styled-components';

const SyledCanvas = styled(Canvas)`
  pre {
    span,
    .plain-text {
      color: #ffffff;
    }
  }
`;

export { SyledCanvas as CustomCanvas };
