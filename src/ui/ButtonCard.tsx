import React, { ComponentProps } from 'react';

import { Button, ButtonVariants } from '@/ui/Button';
import { Paragraph } from '@/ui/Paragraph';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius } from '@/ui/theme';
import { Link, LinkButtonVariants } from './Link';
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
  const buttonCardStyling = `
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #e6e6e6;
  }
`;
  const buttonContent = (
    <>
      <Paragraph
        fontWeight="bold"
        display="flex"
        justifyContent="space-between"
        width="100%"
        textAlign="left"
        minHeight="1.9rem"
      >
        <Text
          width={hasEllipsisOnTitle && `80%`}
          css={
            hasEllipsisOnTitle &&
            `
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          `
          }
        >
          {title}
        </Text>
        {badge}
      </Paragraph>
      {description && (
        <Text
          textAlign="left"
          width="100%"
          css={`
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          `}
        >
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
        width="20rem"
        newTab
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
