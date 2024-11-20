import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { dehydrate, useQueryClient } from 'react-query';

import {
  useGetOrganizerByIdQuery,
  useGetOrganizerPermissions,
} from '@/hooks/api/organizers';
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
import { useLegacyPath } from '@/hooks/useLegacyPath';
import { SupportedLanguage } from '@/i18n/index';
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { OrganizerTable } from './OrganizerTable';

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
  const { publicRuntimeConfig } = getConfig();
  const isOwnershipEnabled = publicRuntimeConfig.ownershipEnabled === 'true';

  const organizerId = useMemo(
    () => router.query.organizerId as string,
    [router.query.organizerId],
  );
  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: organizerId,
  });

  const getOrganizerPermissionsQuery = useGetOrganizerPermissions({
    organizerId: organizerId,
  });

  // @ts-expect-error
  const permissions = getOrganizerPermissionsQuery?.data.permissions ?? [];
  const canEdit = permissions.includes('Organisaties bewerken');

  // @ts-expect-error
  const organizer: Organizer = getOrganizerByIdQuery?.data;

  const organizerName: string = getLanguageObjectOrFallback(
    organizer?.name,
    i18n.language as SupportedLanguage,
    organizer?.mainLanguage as SupportedLanguage,
  );

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
        <Stack>
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
                {isOwnershipRequested && (
                  <Alert
                    variant={AlertVariants.PRIMARY}
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
                )}
                {isSuccessAlertVisible && (
                  <Alert
                    variant={AlertVariants.SUCCESS}
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
                )}
                {isErrorAlertVisible && (
                  <Alert
                    variant={AlertVariants.DANGER}
                    fullWidth
                    closable
                    onClose={() => {
                      setIsErrorAlertVisible(false);
                    }}
                  >
                    <Trans i18nKey="organizers.ownerships.request.confirm_modal.error" />
                  </Alert>
                )}
              </Stack>
              <Inline spacing={5}>
                <Stack flex={3}>
                  <OrganizerTable organizer={organizer} />
                </Stack>
                <Stack spacing={3.5} flex={1}>
                  {!canEdit && isOwnershipEnabled && (
                    <Button
                      variant={ButtonVariants.SECONDARY}
                      onClick={() => setIsQuestionModalVisible(true)}
                    >
                      {t('organizers.detail.actions.request')}
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant={ButtonVariants.SECONDARY}
                      spacing={3}
                      iconName={Icons.PENCIL}
                      onClick={() =>
                        router.push(`/organizer/${organizerId}/edit`)
                      }
                    >
                      {t('organizers.detail.actions.edit')}
                    </Button>
                  )}

                  <Button
                    variant={ButtonVariants.SECONDARY}
                    spacing={3}
                    iconName={Icons.ARROW_LEFT}
                    onClick={() => router.push(`/organizers`)}
                  >
                    {t('organizers.detail.actions.back')}
                  </Button>
                </Stack>
              </Inline>
              <iframe
                height={iframeHeight}
                src={legacyPath}
                ref={iframeRef}
              ></iframe>
            </Stack>
          )}
          {!isOwnershipEnabled && <OrganizerTable organizer={organizer} />}
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    await Promise.all([
      await useGetOrganizerByIdQuery({
        req,
        queryClient,
        id: query.organizerId,
      }),
      await useGetOrganizerPermissions({
        req,
        queryClient,
        organizerId: query.organizerId,
      }),
    ]);
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default OrganizersPreview;
