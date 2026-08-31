import { ReactNode } from 'react';

import { useMatchBreakpoint } from '@/hooks/useMatchBreakpoint';
import { ManIllustrationSvg } from '@/ui/illustrations/ManIllustration';
import { WomanIllustrationSvg } from '@/ui/illustrations/WomanIllustration';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Breakpoints, colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

const getGlobalValue = getValueFromTheme('global');

type Props = InlineProps & {
  title: string;
  description: ReactNode;
};

const Banner = ({ title, description, ...props }: Props) => {
  const isSmallView = useMatchBreakpoint(Breakpoints.S);

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
      {!isSmallView && (
        <ManIllustrationSvg width="16rem" height="6.5rem" flexShrink={0} />
      )}
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Title size={2}>{title}</Title>
        {description}
      </Stack>
      {!isSmallView && (
        <WomanIllustrationSvg width="14rem" height="6.5rem" flexShrink={0} />
      )}
    </Inline>
  );
};

export { Banner };
