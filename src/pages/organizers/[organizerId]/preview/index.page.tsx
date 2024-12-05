import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { dehydrate, useQueryClient, UseQueryResult } from 'react-query';

import {
  GetOrganizerPermissionsResponse,
  useGetOrganizerByIdQuery,
  useGetOrganizerPermissions,
} from '@/hooks/api/organizers';
import {
  OwnershipRequest,
  RequestState,
  useGetOwnershipRequestsQuery,
  useRequestOwnershipMutation,
} from '@/hooks/api/ownerships';
import { useGetUserQuery, User } from '@/hooks/api/user';
import { SupportedLanguage } from '@/i18n/index';
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Link, LinkButtonVariants } from '@/ui/Link';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { FetchError } from '@/utils/fetchFromApi';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { OrganizerTable } from './OrganizerTable';

const OrganizersPreview = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const isOwnershipEnabled = publicRuntimeConfig.ownershipEnabled === 'true';
  const organizerId = router.query.organizerId as string;

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: organizerId,
  }) as UseQueryResult<Organizer, FetchError>;

  const getOrganizerPermissionsQuery = useGetOrganizerPermissions({
    organizerId: organizerId,
  }) as UseQueryResult<GetOrganizerPermissionsResponse, FetchError>;

  const permissions = getOrganizerPermissionsQuery?.data?.permissions ?? [];
  const canEdit = permissions.includes('Organisaties bewerken');

  const organizer: Organizer = getOrganizerByIdQuery?.data;

  const organizerName: string = getLanguageObjectOrFallback(
    organizer?.name,
    i18n.language as SupportedLanguage,
    organizer?.mainLanguage as SupportedLanguage,
  );

  const getUserQuery = useGetUserQuery() as UseQueryResult<User, FetchError>;

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
    onError: () => {
      setIsQuestionModalVisible(false);
      setIsErrorAlertVisible(true);
    },
  });

  return (
    <Page>
      <Page.Title>{organizerName}</Page.Title>
      <Page.Content>
        <Stack>
          <Stack flex={1}>
            {isOwnershipEnabled && (
              <>
                <Modal
                  title={t(
                    'organizers.ownerships.request.confirm_modal.title',
                    {
                      organizerName: organizerName,
                    },
                  )}
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
                {isOwnershipRequested && (
                  <Alert
                    variant={AlertVariants.PRIMARY}
                    marginBottom={4}
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
                    marginBottom={4}
                    closable
                    fullWidth
                    onClose={() => {
                      setIsSuccessAlertVisible(false);
                    }}
                  >
                    <Trans
                      i18nKey="organizers.ownerships.request.success"
                      values={{
                        organizerName: organizerName,
                      }}
                    />
                  </Alert>
                )}
                {isErrorAlertVisible && (
                  <Alert
                    variant={AlertVariants.DANGER}
                    marginBottom={4}
                    fullWidth
                    closable
                    onClose={() => {
                      setIsErrorAlertVisible(false);
                    }}
                  >
                    <Trans i18nKey="organizers.ownerships.request.confirm_modal.error" />
                  </Alert>
                )}
              </>
            )}
            <Inline spacing={5}>
              <Stack flex={3}>
                <OrganizerTable organizer={organizer} />
              </Stack>
              <Stack spacing={3.5} flex={1}>
                {!canEdit && isOwnershipEnabled && !isOwnershipRequested && (
                  <Button
                    variant={ButtonVariants.PRIMARY}
                    spacing={3}
                    iconName={Icons.PLUS_CIRCLE}
                    onClick={() => setIsQuestionModalVisible(true)}
                  >
                    {t('organizers.detail.actions.request')}
                  </Button>
                )}
                {canEdit && (
                  <Link
                    variant={LinkButtonVariants.BUTTON_SECONDARY}
                    spacing={3}
                    iconName={Icons.PENCIL}
                    href={`/organizer/${organizerId}/edit`}
                  >
                    {t('organizers.detail.actions.edit')}
                  </Link>
                )}
                {canEdit && isOwnershipEnabled && !isOwnershipRequested && (
                  <Link
                    variant={LinkButtonVariants.BUTTON_SECONDARY}
                    spacing={3}
                    iconName={Icons.USERS}
                    href={`/organizer/${organizerId}/ownerships`}
                  >
                    {t('organizers.detail.actions.manage')}
                  </Link>
                )}
                <Link
                  variant={LinkButtonVariants.BUTTON_SECONDARY}
                  spacing={3}
                  iconName={Icons.ARROW_LEFT}
                  href={`/organizers`}
                >
                  {t('organizers.detail.actions.back')}
                </Link>
              </Stack>
            </Inline>
          </Stack>
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    try {
      await Promise.all([
        useGetOrganizerByIdQuery({
          req,
          queryClient,
          id: query.organizerId,
        }),
        useGetOrganizerPermissions({
          req,
          queryClient,
          organizerId: query.organizerId,
        }),
      ]);
    } catch (error) {
      console.error(error);
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default OrganizersPreview;
