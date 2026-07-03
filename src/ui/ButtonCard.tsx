import React, { ComponentProps } from 'react';
import { css } from 'styled-components';

import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { cn } from '@/ui/shadcn/utils';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

import { Link } from './Link';
import { Stack } from './Stack';

function ButtonCard({
  title,
  description,
  badge,
  hasEllipsisOnTitle,
  href,
  ...props
}: ComponentProps<typeof Button> & {
  title: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  hasEllipsisOnTitle?: boolean;
  href?: string;
}) {
  const getGlobalValue = getValueFromTheme('global');

  const buttonCardStyling = css`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: white;
    box-shadow: ${getGlobalValue('boxShadow.heavy')};

    &:hover {
      background-color: #e6e6e6;
    }
  `;
  const buttonContent = (
    <>
      <Box
        fontWeight="bold"
        display="flex"
        justifyContent="space-between"
        width="100%"
        textAlign="left"
        minHeight="1.9rem"
      >
        <Text className={cn(hasEllipsisOnTitle && 'tw:w-[80%] tw:truncate')}>
          {title}
        </Text>
        {badge}
      </Box>
      {description && (
        <Text className="tw:w-full tw:truncate tw:text-left">
          {description}
        </Text>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        padding={4}
        borderRadius={getGlobalBorderRadius}
        variant={ButtonVariants.UNSTYLED}
        customChildren
        marginBottom={4}
        title={title}
        minWidth="20rem"
        target="_blank"
        rel="noopener"
        css={buttonCardStyling}
      >
        <Stack>{buttonContent}</Stack>
      </Link>
    );
  }
  return (
    <Button
      padding={4}
      borderRadius={getGlobalBorderRadius}
      variant={ButtonVariants.UNSTYLED}
      customChildren
      marginBottom={4}
      title={title}
      width="20rem"
      css={buttonCardStyling}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}

export { ButtonCard };
