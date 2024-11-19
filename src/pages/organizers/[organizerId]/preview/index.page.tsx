import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { useGetOrganizerByIdQuery } from '@/hooks/api/organizers';
import {
  OwnershipRequest,
  RequestState,
  useGetOwnershipRequestsQuery,
  useRequestOwnershipMutation,
} from '@/hooks/api/ownerships';
import { useGetUserQuery } from '@/hooks/api/user';
import {
  useHandleWindowMessage,
  WindowMessageTypes,
} from '@/hooks/useHandleWindowMessage';
import { useIsClient } from '@/hooks/useIsClient';
import { useLegacyPath } from '@/hooks/useLegacyPath';
import { SupportedLanguage } from '@/i18n/index';
import { parseLocationAttributes } from '@/pages/create/OfferForm';
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Inline } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius } from '@/ui/theme';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const OrganizersPreview = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const isOwnershipEnabled = publicRuntimeConfig.ownershipEnabled === 'true';

  const organizerId = useMemo(
    () => router.query.organizerId as string,
    [router.query.organizerId],
  );
  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: organizerId,
  });

  // @ts-expect-error
  const organizer: Organizer = getOrganizerByIdQuery?.data;

  const organizerName =
    organizer?.name?.[i18n.language] ??
    organizer?.name?.[organizer.mainLanguage] ??
    organizer?.name;

  useHandleWindowMessage({
    [WindowMessageTypes.OWNERSHIP_REQUEST_DIALOG_OPENED]: () =>
      setIsQuestionModalVisible(true),
  });

  useHandleWindowMessage({
    [WindowMessageTypes.PAGE_HEIGHT]: (event) => setIframeHeight(event?.height),
  });

  const getUserQuery = useGetUserQuery();
  // @ts-expect-error
  const userId = getUserQuery.data?.sub;

  const getOwnershipRequestsQuery = useGetOwnershipRequestsQuery({
    organizerId: organizerId,
    ownerId: userId,
  });

  // @ts-expect-error
  const userRequests = getOwnershipRequestsQuery?.data?.member;
  const isOwnershipRequested = userRequests?.some(
    (request: OwnershipRequest) => request.state === RequestState.REQUESTED,
  );

  const requestOwnershipMutation = useRequestOwnershipMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries('ownership-requests');
      setIsSuccessAlertVisible(true);
      setIsQuestionModalVisible(false);
    },
    onError: async () => {
      setIsQuestionModalVisible(false);
      setIsErrorAlertVisible(true);
    },
  });

  useEffect(() => {
    console.log('isOwnershipEnabled', isOwnershipEnabled);
  }, [isOwnershipEnabled]);

  const location = parseLocationAttributes(
    organizer,
    i18n.language as SupportedLanguage,
    organizer.mainLanguage as SupportedLanguage,
  ).location;

  const info = [
    { label: 'name', value: organizerName },
    { label: 'description', value: organizer.educationalDescription },
    {
      label: 'address',
      value: `${location.streetAndNumber}, ${location.postalCode} ${location.municipality.name}`,
    },
    {
      label: 'contact',
      value: Object.values(organizer.contactPoint).map((it) => (
        <div key={it.join(', ')}>{it.join(', ')}</div>
      )),
    },
    {
      label: 'labels',
      value: (organizer.labels ?? []).map((it) => <div key={it}>{it}</div>),
    },
    {
      label: 'images',
      value: (organizer.images ?? []).map((it) => (
        <div key={it.contentUrl}>{it.contentUrl}</div>
      )),
    },
  ];

  return (
    <Page>
      <Page.Title>{organizerName}</Page.Title>
      <Page.Content>
        <Stack
          height="100%"
          width="100%"
          css={`
            overflow-y: auto;
          `}
        >
          {isOwnershipEnabled && (
            <Stack flex={1}>
              <Modal
                title={t('organizers.ownerships.request.confirm_modal.title', {
                  organizerName: organizerName,
                })}
                confirmTitle={t(
                  'organizers.ownerships.request.confirm_modal.confirm',
                )}
                cancelTitle={t(
                  'organizers.ownerships.request.confirm_modal.cancel',
                )}
                visible={isQuestionModalVisible}
                variant={ModalVariants.QUESTION}
                onClose={() => setIsQuestionModalVisible(false)}
                onConfirm={() => {
                  requestOwnershipMutation.mutate({
                    itemId: organizerId,
                    ownerId: userId,
                  });
                }}
                size={ModalSizes.MD}
              >
                <Box padding={4}>
                  <Trans
                    i18nKey="organizers.ownerships.request.confirm_modal.body"
                    values={{
                      organizerName: organizerName,
                    }}
                  />
                </Box>
              </Modal>
              <Stack marginBottom={5} spacing={4}>
                <Alert
                  variant={AlertVariants.PRIMARY}
                  visible={isOwnershipRequested}
                  marginBottom={5}
                  fullWidth
                >
                  <Trans
                    i18nKey="organizers.ownerships.request.pending"
                    values={{
                      organizerName: organizerName,
                    }}
                  />
                </Alert>
                <Alert
                  variant={AlertVariants.SUCCESS}
                  visible={isSuccessAlertVisible}
                  closable
                  onClose={() => {
                    setIsSuccessAlertVisible(false);
                  }}
                >
                  <Trans
                    i18nKey="organizers.ownerships.request.confirm_modal.body"
                    values={{
                      organizerName: organizerName,
                    }}
                  />
                </Alert>
                <Alert
                  variant={AlertVariants.DANGER}
                  visible={isErrorAlertVisible}
                  fullWidth
                  closable
                  onClose={() => {
                    setIsErrorAlertVisible(false);
                  }}
                >
                  <Trans i18nKey="organizers.ownerships.request.confirm_modal.error" />
                </Alert>
              </Stack>
            </Stack>
          )}

          <Stack
            backgroundColor="white"
            padding={4}
            borderRadius={getGlobalBorderRadius}
          >
            {info.map((it, index) => {
              const isLast = index === info.length - 1;
              return (
                <Inline
                  spacing={3}
                  paddingY={2}
                  key={it.label}
                  css={`
                    border-bottom: ${isLast ? 'none' : '1px solid lightgrey'};
                  `}
                >
                  <Text fontWeight="bold" width="8rem">
                    {it.label}
                  </Text>
                  <div>{it.value}</div>
                </Inline>
              );
            })}
          </Stack>
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default OrganizersPreview;
