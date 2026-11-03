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

type DefaultBannerProps = InlineProps & {
  variant?: typeof BannerVariants.DEFAULT;
  title: string;
  description: ReactNode;
};

type SmallBannerProps = InlineProps & {
  variant: typeof BannerVariants.SMALL;
  description: ReactNode;
  iconName?: Values<typeof Icons>;
};

type Props = DefaultBannerProps | SmallBannerProps;

const Banner = (props: Props) => {
  if (props.variant === BannerVariants.SMALL) {
    const { variant, description, iconName = Icons.INFO, ...rest } = props;
    return (
      <Box
        {...sharedStyles}
        paddingY={3}
        paddingX={{ default: 7, s: 4 }}
        textAlign="center"
        role="status"
        {...getBoxProps(rest)}
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

  const { variant, title, description, ...rest } = props;

  return (
    <Inline
      {...sharedStyles}
      spacing={4}
      padding={4}
      alignItems="center"
      justifyContent="space-evenly"
      {...getInlineProps(rest)}
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
