import { ReactElement } from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';
import { css } from 'styled-components';

import { parseSpacing } from './Box';
import { Inline } from './Inline';
import { Stack } from './Stack';
import { Text } from './Text';
import { getGlobalBorderRadius, getValueFromTheme } from './theme';

const getValue = getValueFromTheme('toast');
const getGlobalValue = getValueFromTheme('global');

const commonCss = css`
  &.toast {
    border-radius: ${getGlobalBorderRadius};
    border: none;

    max-width: none;

    background-color: white;

    position: fixed;
    right: ${parseSpacing(4)()};
    bottom: ${parseSpacing(6.5)()};

    z-index: ${getValue('zIndex')};

    min-width: fit-content;

    box-shadow: ${getGlobalValue('boxShadow.heavy')};
  }
`;

type Props = {
  icon?: ReactElement;
  header?: ReactElement;
  body: ReactElement;
  className?: string;
};

const NotificationLegacy = ({ icon, header, body, className }: Props) => {
  return (
    <BootstrapToast
      className={className}
      css={css`
        ${commonCss}
      `}
    >
      <Inline
        spacing={4}
        paddingTop={4}
        paddingBottom={4}
        paddingRight={5}
        paddingLeft={4}
        alignItems="center"
        justifyContent="center"
        color={getValue('textColor.dark')}
      >
        {icon && <Stack alignItems="center">{icon}</Stack>}
        <Stack>
          {header}
          <Text className="tw:text-base">{body}</Text>
        </Stack>
      </Inline>
    </BootstrapToast>
  );
};

export { NotificationLegacy };
