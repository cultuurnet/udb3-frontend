import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useMemo, useRef, useState } from 'react';
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
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

const OrganizersPreview = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [iframeHeight, setIframeHeight] = useState(0);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);
  const iframeRef = useRef(null);
  const legacyPath = useLegacyPath();
  const router = useRouter();
  const isClientSide = typeof window !== 'undefined';
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
              {isClientSide && (
                <iframe
                  height={
                    iframeHeight ? `${iframeHeight}px` : `${window.innerHeight}`
                  }
                  onLoad={() => {
                    iframeRef.current.contentWindow.postMessage('test', '*');
                  }}
                  src={legacyPath}
                  ref={iframeRef}
                ></iframe>
              )}
            </Stack>
          )}
          {!isOwnershipEnabled && isClientSide && (
            <iframe
              height={
                iframeHeight ? `${iframeHeight}px` : `${window.innerHeight}`
              }
              src={legacyPath}
            ></iframe>
          )}
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default OrganizersPreview;
