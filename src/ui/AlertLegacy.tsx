import type { Values } from '@/types/Values';
import { parseSpacing } from '@/ui/Box';

import { Button } from './Button';
import { ButtonVariants } from './Button';
import { Icon, Icons, IconVariants } from './Icon';
import type { InlineProps } from './Inline';
import { Inline } from './Inline';
import { getStackProps, Stack } from './Stack';
import { Text } from './Text';
import { getValueFromTheme } from './theme';

const AlertVariants = {
  PRIMARY: 'primary',
  INFO: 'info',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
} as const;

const AlertVariantIconsMap = {
  [AlertVariants.PRIMARY]: (
    <Icon name={Icons.INFO} width={24} height={24} variant={IconVariants.INFO} />
  ),
  [AlertVariants.SUCCESS]: (
    <Icon
      name={Icons.CHECK_CIRCLE}
      width={24}
      height={24}
      variant={IconVariants.SUCCESS}
    />
  ),
  [AlertVariants.WARNING]: (
    <Icon
      name={Icons.EXCLAMATION_TRIANGLE}
      width={24}
      height={24}
      variant={IconVariants.WARNING}
    />
  ),
  [AlertVariants.DANGER]: (
    <Icon
      name={Icons.EXCLAMATION_CIRCLE}
      width={24}
      height={24}
      variant={IconVariants.DANGER}
    />
  ),
};

const getValue = getValueFromTheme(`alert`);

type AlertProps = InlineProps & {
  variant?: Values<typeof AlertVariants>;
  visible?: boolean;
  fullWidth?: boolean;
  closable?: boolean;
  onClose?: () => void;
};

const AlertLegacy = ({
  variant = AlertVariants.PRIMARY,
  visible = true,
  children,
  fullWidth,
  closable,
  onClose,
  className,
  ...props
}: AlertProps) => {
  return (
    <Inline
      role="alert"
      data-testid={`alert-${variant}`}
      alignSelf={fullWidth ? 'normal' : 'flex-start'}
      display={visible ? 'flex' : 'none'}
      className={className}
      {...getStackProps(props)}
      padding={4}
      borderRadius={getValue('borderRadius')}
      variant={variant}
      backgroundColor={getValue(`backgroundColor.${variant}`)}
      css={`
        position: relative;
        border: 1px solid ${getValue(`borderColor.${variant}`)};
        &::before {
          position: absolute;
          content: '';
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background-color: ${getValue(`borderColor.${variant}`)};
          display: block;
          border-top-left-radius: ${getValue('borderRadius')};
          border-bottom-left-radius: ${getValue('borderRadius')};
        }
      `}
    >
      <Inline spacing={3} flex={1}>
        <Stack>{AlertVariantIconsMap[variant]}</Stack>
        {typeof children !== 'string' ? (
          <Text>{children}</Text>
        ) : (
          <Text
            dangerouslySetInnerHTML={{ __html: children as string }}
            css={`
              strong {
                font-weight: bold;
              }

              ul {
                list-style-type: disc;
                margin-bottom: ${parseSpacing(4)};

                li {
                  margin-left: ${parseSpacing(5)};
                }
              }
            `}
          />
        )}
      </Inline>
      {closable && (
        <Button
          variant={ButtonVariants.UNSTYLED}
          iconName={Icons.TIMES_CIRCLE}
          className="tw:self-center tw:rounded-full tw:w-7.5 tw:h-7.5 tw:inline-flex tw:items-center tw:justify-center"
          css={`
            color: ${getValue(`borderColor.${variant}`)};
            cursor: pointer;
            transition: background 0.2s;
            &:hover {
              background-color: inherit;
              filter: brightness(95%);
            }
            &:active {
              background-color: inherit;
              filter: brightness(95%) saturate(150%);
            }
          `}
          onClick={onClose}
        ></Button>
      )}
    </Inline>
  );
};

export { AlertLegacy };
