import { ReactNode, useMemo, useState } from 'react';

import { ScopeTypes } from '@/constants/OfferType';
import { Status, StatusIndicator } from '@/pages/dashboard/index.page';
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
import { Text } from '@/ui/Text';
import { colors, getValueFromTheme } from '@/ui/theme';

import { getInlineProps, Inline } from '../../ui/Inline';

type DashboardRowProps = {
  title: string;
  description?: string;
  eventId?: string;
  type?: string;
  typeId?: string;
  scope?: string;
  date?: string;
  imageUrl?: string;
  score?: number;
  actions: ReactNode[];
  url: string;
  finishedAt?: string;
  isFinished?: boolean;
  status?: Status;
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
  actions,
  url,
  finishedAt,
  isFinished,
  status,
  isImageUploading,
  onModalOpen,
  children,
  ...props
}: DashboardRowProps) => {
  const getValue = getValueFromTheme('dashboardPage');
  const { udbMainPositiveGreen, udbMainLightGreen, udbMainGrey, grey3 } =
    colors;
  const [isImageHovered, setIsImageHovered] = useState(false);
  const weights = getScopeWeights(scope);
  const minimumScore = useMemo(() => getMinimumScore(weights), [weights]);
  return (
    <Inline spacing={5} {...getInlineProps(props)} flex={1}>
      {children}
      <Inline width="100" alignItems="center">
        {imageUrl && (
          <Image src={imageUrl} alt={title} width={100} height={100} />
        )}
        {!imageUrl && !isFinished && (
          <span
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            <Box
              css={`
                ${!isImageUploading &&
                `border: 1px solid ${udbMainGrey}; border-radius: 0.5rem;
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
              width={100}
              height={100}
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
            width={100}
            height={100}
            display="flex"
            justifyContent="center"
            alignItems="center"
            backgroundColor={grey3}
          >
            <Image
              src={`/assets/uit-logo.svg`}
              alt="No image available"
              width={45}
              height={45}
            />
          </Box>
        )}
      </Inline>
      <Stack spacing={4} flex={1}>
        <Link
          href={url}
          color={getValue('listItem.color')}
          fontWeight="bold"
          css={`
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: 35rem;
            display: block;
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
              width="22.5%"
              spacing={3}
              alignItems="flex-start"
              css={`
                word-break: break-all;
                white-space: normal;
              `}
            >
              <Inline spacing={3} alignItems="center">
                <Icon name={Icons.TAG} />
                <Text>{type}</Text>
              </Inline>
              <Inline spacing={3} alignItems="center">
                <Icon name={Icons.CALENDAR_ALT} />
                <Text>{date}</Text>
              </Inline>
            </Stack>
          )}
          <Inline
            width="22.5%"
            justifyContent="flex-start"
            alignItems="center"
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
          <Inline width="22.5%" justifyContent="flex-start" alignItems="center">
            <StatusIndicator label={status.label} color={status.color} />
          </Inline>
          <Inline width="22.5%" justifyContent="flex-end" alignItems="center">
            {finishedAt ? (
              <Text
                color={getValue('listItem.passedEvent.color')}
                textAlign="center"
              >
                {finishedAt}
              </Text>
            ) : (
              actions.length > 0 && (
                <Dropdown variant={DropDownVariants.SECONDARY} isSplit>
                  {actions}
                </Dropdown>
              )
            )}
          </Inline>
        </Inline>
      </Stack>
    </Inline>
  );
};

DashboardRow.defaultProps = {
  actions: [],
};
