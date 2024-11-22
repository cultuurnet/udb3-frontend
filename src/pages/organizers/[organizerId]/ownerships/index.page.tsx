import groupBy from 'lodash/groupBy';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { dehydrate, useQueryClient } from 'react-query';

import { useGetOrganizerByIdQuery } from '@/hooks/api/organizers';
import {
  OwnershipRequest,
  RequestState,
  useApproveOwnershipRequestMutation,
  useDeleteOwnershipRequestMutation,
  useGetOwnershipCreatorQuery,
  useGetOwnershipRequestsQuery,
  useRejectOwnershipRequestMutation,
} from '@/hooks/api/ownerships';
import { Organizer } from '@/types/Organizer';
import { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Title } from '@/ui/Title';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OwnershipsTable } from './OwnershipsTable';

const ActionType = {
  APPROVE: 'approve',
  REJECT: 'reject',
} as const;

type ActionType = Values<typeof ActionType>;

const Ownership = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<OwnershipRequest>();
  const [requestToBeDeleted, setRequestToBeDeleted] =
    useState<OwnershipRequest>();
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<ActionType>();
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const isApproveAction = actionType === ActionType.APPROVE;
  const translationsPath = `organizers.ownerships.${
    isApproveAction ? 'confirm' : 'reject'
  }_modal`;

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

  const getOwnershipRequestsQuery = useGetOwnershipRequestsQuery({
    organizerId: organizerId,
  });

  const getOwnershipCreatorQuery = useGetOwnershipCreatorQuery({
    organizerId: organizerId,
  });

  const requestsByState: { [key: string]: OwnershipRequest[] } = useMemo(
    () =>
      groupBy(
        // @ts-expect-error
        getOwnershipRequestsQuery.data?.member,
        'state',
      ),
    // @ts-expect-error
    [getOwnershipRequestsQuery.data],
  );

  // @ts-expect-error
  const creator = getOwnershipCreatorQuery.data;

  const approvedRequests = requestsByState[RequestState.APPROVED] ?? [];
  const pendingRequests = requestsByState[RequestState.REQUESTED] ?? [];

  const approveOwnershipRequestMutation = useApproveOwnershipRequestMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries('ownership-requests');
      setIsSuccessAlertVisible(true);
      setIsQuestionModalVisible(false);
    },
  });

  const rejectOwnershipRequestMutation = useRejectOwnershipRequestMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries('ownership-requests');
      setIsSuccessAlertVisible(true);
      setIsQuestionModalVisible(false);
    },
  });

  const deleteOwnershipRequestMutation = useDeleteOwnershipRequestMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries('ownership-requests');
      setRequestToBeDeleted(undefined);
    },
  });

  const handleConfirm = () => {
    if (isApproveAction) {
      approveOwnershipRequestMutation.mutate({
        ownershipId: selectedRequest.id,
      });
    } else {
      rejectOwnershipRequestMutation.mutate({
        ownershipId: selectedRequest.id,
      });
    }
  };

  return (
    <Page>
      <Page.Title>
        {t('organizers.ownerships.title', {
          name: organizerName,
        })}
      </Page.Title>
      <Page.Content>
        <Inline spacing={5}>
          <Stack spacing={5} flex={3}>
            <Alert variant={AlertVariants.PRIMARY} fullWidth>
              {t('organizers.ownerships.info')}
            </Alert>
            {isSuccessAlertVisible && (
              <Alert
                variant={AlertVariants.SUCCESS}
                fullWidth
                closable
                onClose={() => {
                  setIsSuccessAlertVisible(false);
                  setSelectedRequest(undefined);
                  setActionType(undefined);
                }}
              >
                <Trans
                  i18nKey={`${translationsPath}.success`}
                  values={{
                    ownerEmail: selectedRequest?.ownerEmail,
                    organizerName: organizerName,
                  }}
                />
              </Alert>
            )}
            {(approvedRequests.length > 0 || !!creator) && (
              <Stack spacing={4}>
                <Title size={3}>{t('organizers.ownerships.owners')}</Title>
                <OwnershipsTable
                  creator={creator}
                  requests={approvedRequests}
                  renderActions={(request) => (
                    <Button
                      variant={ButtonVariants.ICON}
                      iconName={Icons.TRASH}
                      onClick={() => setRequestToBeDeleted(request)}
                    />
                  )}
                />
                <Modal
                  title={t('organizers.ownerships.delete_modal.title')}
                  confirmTitle={t('organizers.ownerships.delete_modal.confirm')}
                  cancelTitle={t('organizers.ownerships.delete_modal.cancel')}
                  visible={!!requestToBeDeleted}
                  variant={ModalVariants.QUESTION}
                  onConfirm={() =>
                    deleteOwnershipRequestMutation.mutate({
                      ownershipId: requestToBeDeleted.id,
                    })
                  }
                  onClose={() => setRequestToBeDeleted(undefined)}
                  size={ModalSizes.MD}
                >
                  <Box padding={4}>
                    <Trans
                      i18nKey="organizers.ownerships.delete_modal.body"
                      values={{
                        ownerEmail: requestToBeDeleted?.ownerEmail,
                      }}
                    />
                  </Box>
                </Modal>
              </Stack>
            )}
            {pendingRequests.length > 0 && (
              <Stack spacing={4}>
                <Title size={3}>{t('organizers.ownerships.pending')}</Title>
                <OwnershipsTable
                  requests={pendingRequests}
                  renderActions={(request) => (
                    <Inline spacing={3}>
                      <Button
                        variant={ButtonVariants.SUCCESS}
                        iconName={Icons.CHECK_CIRCLE}
                        spacing={3}
                        onClick={() => {
                          setIsQuestionModalVisible(true);
                          setSelectedRequest(request);
                          setActionType(ActionType.APPROVE);
                        }}
                      >
                        {t('organizers.ownerships.table.actions.approve')}
                      </Button>
                      <Button
                        variant={ButtonVariants.DANGER}
                        iconName={Icons.TIMES_CIRCLE}
                        spacing={3}
                        onClick={() => {
                          setIsQuestionModalVisible(true);
                          setSelectedRequest(request);
                          setActionType(ActionType.REJECT);
                        }}
                      >
                        {t('organizers.ownerships.table.actions.reject')}
                      </Button>
                    </Inline>
                  )}
                />
                <Modal
                  title={t(`${translationsPath}.title`)}
                  confirmTitle={t(`${translationsPath}.confirm`)}
                  cancelTitle={t(`${translationsPath}.cancel`)}
                  visible={isQuestionModalVisible}
                  variant={ModalVariants.QUESTION}
                  onConfirm={handleConfirm}
                  onClose={() => setIsQuestionModalVisible(false)}
                  size={ModalSizes.MD}
                >
                  <Box padding={4}>
                    <Trans
                      i18nKey={`${translationsPath}.body`}
                      values={{
                        ownerEmail: selectedRequest?.ownerEmail,
                        organizerName: organizerName,
                      }}
                    />
                  </Box>
                </Modal>
              </Stack>
            )}
          </Stack>
          <Stack spacing={3.5} flex={1}>
            <Button variant={ButtonVariants.PRIMARY}>
              {t('organizers.ownerships.actions.add')}
            </Button>
            <Button
              variant={ButtonVariants.SECONDARY}
              spacing={3}
              iconName={Icons.ARROW_LEFT}
              onClick={() => router.push(`/organizer/${organizerId}/preview`)}
            >
              {t('organizers.ownerships.actions.back')}
            </Button>
          </Stack>
        </Inline>
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
      await useGetOwnershipRequestsQuery({
        req,
        queryClient,
        organizerId: query.organizerId,
      }),
      await useGetOwnershipCreatorQuery({
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

export default Ownership;
