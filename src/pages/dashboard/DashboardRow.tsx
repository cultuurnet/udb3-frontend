import getConfig from 'next/config';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Scope, ScopeTypes } from '@/constants/OfferType';
import type { PublicationStatusInfo } from '@/hooks/usePublicationStatus';
import { ImageIcon } from '@/pages/PictureUploadBox';
import {
  DynamicBarometerIcon,
  getMinimumScore,
  getScopeWeights,
} from '@/pages/steps/AdditionalInformationStep/FormScore';
import { Box } from '@/ui/Box';
import { Dropdown, DropDownVariants } from '@/ui/Dropdown';
import { Icon, Icons } from '@/ui/Icon';
import { Image } from '@/ui/Image';
import { Link } from '@/ui/Link';
import { Spinner } from '@/ui/Spinner';
import { Stack } from '@/ui/Stack';
import { StatusIndicator } from '@/ui/StatusIndicator';
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';

import { getInlineProps, Inline } from '../../ui/Inline';

type DashboardRowProps = {
  title: string;
  description?: string;
  eventId?: string;
  type?: string;
  typeId?: string;
  scope?: Scope;
  date?: string;
  imageUrl?: string;
  score?: number;
  actions: ReactNode[];
  url: string;
  finishedAt?: string;
  isFinished?: boolean;
  status?: PublicationStatusInfo;
  isOwnershipRequested?: boolean;
  isImageUploading: boolean;
  onModalOpen: () => void;
  children: ReactNode;
};

export const DashboardRow = ({
  title,
  description,
  eventId,
  type,
  typeId,
  scope,
  date,
  imageUrl,
  score,
  actions = [],
  url,
  finishedAt,
  isFinished,
  status,
  isOwnershipRequested,
  isImageUploading,
  onModalOpen,
  children,
  ...props
}: DashboardRowProps) => {
  const { t } = useTranslation();
  const getValue = getValueFromTheme('dashboardPage');
  const { publicRuntimeConfig } = getConfig();
  const { udbMainPositiveGreen, udbMainLightGreen, udbMainGrey, grey3 } =
    colors;
  const [isImageHovered, setIsImageHovered] = useState(false);
  const weights = getScopeWeights(scope);
  const minimumScore = useMemo(() => getMinimumScore(weights), [weights]);
  const croppedImageBaseUrl = publicRuntimeConfig.imgixUrl;
  const imageIdAndFormat = imageUrl?.split('/').at(-1);
  const croppedImageUrl = imageUrl
    ? `${croppedImageBaseUrl}${imageIdAndFormat}?fit=crop&crop=auto&w=500&h=500`
    : undefined;
  return (
    <Inline spacing={5} {...getInlineProps(props)} flex={1}>
      {children}
      <Inline alignItems="center">
        {imageUrl && (
          <Image
            src={croppedImageUrl}
            alt={title}
            width={150}
            height={150}
            css={`
              border-radius: 0.5rem 0 0 0.5rem;
            `}
          />
        )}
        {!imageUrl && !isFinished && (
          <span
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            <Box
              css={`
                ${!isImageUploading &&
                `border: 1px solid ${udbMainGrey}; border-radius: 0.5rem 0 0 0.5rem;
              :hover {
                border: 1px dashed ${udbMainPositiveGreen}; cursor: pointer; 
              }
              :active {
                background-color: ${udbMainLightGreen}; box-shadow: ${getValue(
                  'boxShadow.small',
                )};
              }  
                `}
              `}
              width={150}
              height={150}
              display="flex"
              justifyContent="center"
              alignItems="center"
              onClick={() => onModalOpen()}
            >
              {isImageUploading ? (
                <Spinner />
              ) : (
                <ImageIcon
                  width="50"
                  color={isImageHovered ? udbMainPositiveGreen : udbMainGrey}
                />
              )}
            </Box>
          </span>
        )}
        {!imageUrl && isFinished && (
          <Box
            width={150}
            height={150}
            css={`
              border-radius: 0.5rem 0 0 0.5rem;
            `}
            display="flex"
            justifyContent="center"
            alignItems="center"
            backgroundColor={grey3}
          >
            <Image
              src={`/assets/uit-logo.svg`}
              alt="No image available"
              width={70}
              height={70}
            />
          </Box>
        )}
      </Inline>
      <Stack
        spacing={4}
        flex={1}
        css={`
          padding: 1.2rem;
        `}
        justifyContent="center"
      >
        <Link
          href={url}
          color={getValue('listItem.color')}
          fontWeight="bold"
          css={`
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: 38rem;
            display: block;
            font-size: 18px;
            text-decoration: none;
          `}
        >
          {title}
        </Link>
        <Inline
          justifyContent="space-between"
          alignItems="flex-start"
          css={`
            width: 100%;
          `}
        >
          {scope !== ScopeTypes.ORGANIZERS && (
            <Stack
              width="25%"
              spacing={3}
              alignItems="flex-start"
              css={`
                word-break: break-word;
                white-space: normal;
              `}
            >
              <Inline spacing={3} alignItems="center">
                <Icon name={Icons.TAG} />
                <Text
                  css={`
                    line-height: 1.2rem;
                  `}
                >
                  {type}
                </Text>
              </Inline>
              <Inline spacing={3} alignItems="center">
                <Icon name={Icons.CALENDAR_ALT} />
                <Text>{date}</Text>
              </Inline>
            </Stack>
          )}
          <Inline
            width="25%"
            justifyContent="flex-start"
            alignItems="flex-start"
            css={!score && `visibility: hidden`}
          >
            <DynamicBarometerIcon
              minimumScore={minimumScore}
              score={score}
              size={30}
              margin={{ top: 0.0, bottom: 0.05, left: 0.4, right: 0.4 }}
              pointerWidth={100}
            />
            <Text marginLeft={3}>{`${score} / 100`}</Text>
          </Inline>
          <Inline width="25%" justifyContent="flex-start" alignItems="center">
            <StatusIndicator label={status.label} color={status.color} />
          </Inline>
          <Inline
            width="22.5%"
            justifyContent="flex-end"
            alignItems="center"
            data-testid="row-actions"
          >
            {finishedAt && (
              <Text
                color={getValue('listItem.passedEvent.color')}
                textAlign="center"
              >
                {finishedAt}
              </Text>
            )}
            {!finishedAt && isOwnershipRequested && (
              <Inline spacing={2} alignItems="center">
                <Icon name={Icons.CHECK} color={colors.udbMainPositiveGreen} />
                <Text>{t('organizers.ownerships.requested')}</Text>
              </Inline>
            )}
            {!finishedAt && !isOwnershipRequested && actions.length > 0 && (
              <Dropdown variant={DropDownVariants.SECONDARY} isSplit>
                {actions}
              </Dropdown>
            )}
          </Inline>
        </Inline>
      </Stack>
    </Inline>
  );
};
