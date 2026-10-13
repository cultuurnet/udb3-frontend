import { ReactNode } from 'react';

import { ManIllustrationSvg } from '@/ui/illustrations/ManIllustration';
import { WomanIllustrationSvg } from '@/ui/illustrations/WomanIllustration';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

const getGlobalValue = getValueFromTheme('global');

type Props = InlineProps & {
  title: string;
  description: ReactNode;
};

const Banner = ({ title, description, ...props }: Props) => {
  return (
    <Inline
      forwardedAs="div"
      width="100%"
      spacing={4}
      padding={4}
      alignItems="center"
      justifyContent="space-evenly"
      borderRadius="0.5rem"
      backgroundColor={colors.udbMainLightBlue}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
      `}
      {...getInlineProps(props)}
    >
      <ManIllustrationSvg
        width="16rem"
        height="6.5rem"
        flexShrink={0}
        display={{ default: 'flex', s: 'none' }}
        aria-hidden="true"
      />
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Title size={2}>{title}</Title>
        {description}
      </Stack>
      <WomanIllustrationSvg
        width="14rem"
        height="6.5rem"
        flexShrink={0}
        display={{ default: 'flex', s: 'none' }}
        aria-hidden="true"
      />
    </Inline>
  );
};

export { Banner };
