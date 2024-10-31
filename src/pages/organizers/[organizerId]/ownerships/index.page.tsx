import groupBy from 'lodash/groupBy';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { dehydrate, useQueryClient } from 'react-query';

import { useGetOrganizerByIdQuery } from '@/hooks/api/organizers';
import {
  OwnershipRequest,
  RequestState,
  useApproveOwnershipRequestMutation,
  useRequestOwnershipMutation,
  useDeleteOwnershipRequestMutation,
  useGetOwnershipRequestsQuery,
  useRejectOwnershipRequestMutation,
} from '@/hooks/api/ownerships';
import { Organizer } from '@/types/Organizer';
import { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Title } from '@/ui/Title';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { OwnershipsTable } from './OwnershipsTable';

const ActionType = {
  APPROVE: 'confirm',
  REJECT: 'reject',
  REQUEST: 'request',
} as const;

type ActionType = Values<typeof ActionType>;

const Ownership = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [actionType, setActionType] = useState<ActionType>();
  const [isOpen, setIsOpen] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [requestToBeDeleted, setRequestToBeDeleted] =
    useState<OwnershipRequest>();
  const [selectedRequest, setSelectedRequest] = useState<OwnershipRequest>();
  const isApproveAction = actionType === ActionType.APPROVE;
  const translationsPath = `organizers.ownerships.${ActionType}_modal`;
  const { register, getValues } = useForm();

  const organizerId = useMemo(
    () => router.query.organizerId as string,
    [router.query.organizerId],
  );

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: organizerId,
  });

  // @ts-expect-error
  const organizer: Organizer = getOrganizerByIdQuery?.data;

  const getOwnershipRequestsQuery = useGetOwnershipRequestsQuery({
    organizerId,
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

  const approvedRequests = requestsByState[RequestState.APPROVED] ?? [];
  const pendingRequests = requestsByState[RequestState.REQUESTED] ?? [];

  const approveOwnershipRequestMutation = useApproveOwnershipRequestMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries('ownership-requests');
      setIsSuccessAlertVisible(true);
      setIsQuestionModalVisible(false);
    },
  });

  const requestOwnership = useRequestOwnershipMutation({
    onSuccess: () =>
      approveOwnershipRequestMutation.mutateAsync({
        ownershipId: response.data.id,
      }),
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
    switch (actionType) {
      case ActionType.APPROVE:
        return approveOwnershipRequestMutation.mutate({
          ownershipId: selectedRequest.id,
        });
      case ActionType.REJECT:
        return rejectOwnershipRequestMutation.mutate({
          ownershipId: selectedRequest.id,
        });
      case ActionType.REQUEST:
        const email = getValues('email');
        return requestOwnership.mutateAsync({
          ownerEmail: email,
          itemType: 'organizer',
          itemId: organizer['@id'],
        });
    }
  };

  return (
    <Page>
      <Page.Title>
        {t('organizers.ownerships.title', {
          name: organizer?.name?.[i18n.language],
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
                    organizerName: organizer?.name?.[i18n.language],
                  }}
                />
              </Alert>
            )}
            <Stack spacing={4}>
              <Title size={3}>{t('organizers.ownerships.owners')}</Title>
              <OwnershipsTable
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
                        organizerName: organizer?.name?.[i18n.language],
                      }}
                    />
                  </Box>
                </Modal>
              </Stack>
            )}
          </Stack>
          <Stack spacing={3.5} flex={1}>
            <Button
              variant={ButtonVariants.PRIMARY}
              onClick={() => setIsOpen(true)}
            >
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
        <Modal
          visible={isOpen}
          variant={ModalVariants.QUESTION}
          size={ModalSizes.MD}
          title={t('organizers.ownerships.modal.title', {
            name: organizer.name,
          })}
          confirmTitle={t('organizers.ownerships.modal.actions.confirm')}
          cancelTitle={t('organizers.ownerships.modal.actions.cancel')}
          onConfirm={handleConfirm}
          onClose={() => setIsOpen(false)}
        >
          <Stack padding={4}>
            <FormElement
              id={'email'}
              Component={<Input type={'email'} {...register('email')} />}
              label={t('organizers.ownerships.modal.email')}
            />
          </Stack>
        </Modal>
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
