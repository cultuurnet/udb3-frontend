import { ReactNode } from 'react';

import type { Values } from '@/types/Values';
import { Box, getBoxProps } from '@/ui/Box';
import { Icon, Icons } from '@/ui/Icon';
import { ManIllustrationSvg } from '@/ui/illustrations/ManIllustration';
import { WomanIllustrationSvg } from '@/ui/illustrations/WomanIllustration';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { colors, getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

const getGlobalValue = getValueFromTheme('global');

const BannerVariants = {
  DEFAULT: 'default',
  SMALL: 'small',
} as const;

const sharedStyles = {
  forwardedAs: 'div',
  width: '100%',
  borderRadius: '0.5rem',
  backgroundColor: colors.udbMainLightBlue,
  css: `
    box-shadow: ${getGlobalValue('boxShadow.medium')};
  `,
} as const;

type Props = InlineProps & {
  variant?: Values<typeof BannerVariants>;
  title?: string;
  description: ReactNode;
  iconName?: Values<typeof Icons>;
};

const Banner = ({
  variant = BannerVariants.DEFAULT,
  title,
  description,
  iconName = Icons.INFO,
  ...props
}: Props) => {
  if (variant === BannerVariants.SMALL) {
    return (
      <Box
        {...sharedStyles}
        paddingY={3}
        paddingX={{ default: 7, s: 4 }}
        textAlign="center"
        {...getBoxProps(props)}
      >
        <Box
          forwardedAs="span"
          display="inline-flex"
          marginRight={3}
          color={colors.udbMainDarkBlue}
          css={`
            vertical-align: middle;
          `}
        >
          <Icon name={iconName} />
        </Box>
        {description}
      </Box>
    );
  }

  return (
    <Inline
      {...sharedStyles}
      spacing={4}
      padding={4}
      alignItems="center"
      justifyContent="space-evenly"
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

export { Banner, BannerVariants };
