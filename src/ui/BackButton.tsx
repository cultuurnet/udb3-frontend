import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { parseDimension } from './Box';
import { Button, ButtonVariants } from './Button';
import { Icons } from './Icon';

type BackButtonProps = {
  onClick?: () => void;
  children?: React.ReactNode;
  translationKey?: string;
  width?: string;
  marginTop?: number;
  className?: string;
  disabled?: boolean;
  iconWidth?: number | string;
  iconHeight?: number | string;
};

const BackButton = ({
  onClick,
  children,
  translationKey = 'common.back_to_overview',
  width = 'fit-content',
  marginTop = 4,
  className,
  disabled = false,
  iconWidth = 18,
  iconHeight = 15, // Different height for better visual alignment
}: BackButtonProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const buttonText = children || t(translationKey);

  const handleClick = onClick || (() => router.back());

  return (
    <Button
      width={width}
      marginTop={marginTop}
      variant={ButtonVariants.SECONDARY}
      onClick={handleClick}
      className={className}
      disabled={disabled}
      title={buttonText.toString()}
      iconName={Icons.ARROW_LEFT}
      css={`
        .svg-inline--fa {
          width: ${parseDimension(iconWidth)};
          height: ${parseDimension(iconHeight)};
          margin-right: 1rem;
        }
      `}
    >
      {buttonText}
    </Button>
  );
};

export { BackButton };
