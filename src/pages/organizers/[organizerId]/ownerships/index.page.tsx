import { yupResolver } from '@hookform/resolvers/yup';
import groupBy from 'lodash/groupBy';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { dehydrate, useQueryClient, UseQueryResult } from 'react-query';
import * as yup from 'yup';

import {
  prefetchGetOrganizerByIdQuery,
  useGetOrganizerByIdQuery,
} from '@/hooks/api/organizers';
import {
  GetOwnershipRequestsResponse,
  OwnershipRequest,
  OwnershipState,
  prefetchGetOwnershipCreatorQuery,
  prefetchGetOwnershipRequestsQuery,
  useApproveOwnershipRequestMutation,
  useDeleteOwnershipRequestMutation,
  useGetOwnershipCreatorQuery,
  useGetOwnershipRequestsQuery,
  useRejectOwnershipRequestMutation,
  useRequestOwnershipMutation,
} from '@/hooks/api/ownerships';
import { ActionType } from '@/hooks/ownerships/useOwnershipActions';
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Link } from '@/ui/Link';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { Title } from '@/ui/Title';
import { ErrorBody, FetchError } from '@/utils/fetchFromApi';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { parseOfferId } from '@/utils/parseOfferId';

import { OwnershipsTable } from './OwnershipsTable';

const NON_EXISTING_USER_ERROR_REGEX = /No user with email .+ was found/;

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
  const [lastRequestedEmail, setLastRequestedEmail] = useState('');
  const translationsPath = `organizers.ownerships.${actionType}_modal`;
  const { trigger, register, formState, getValues, setError, reset } = useForm({
    resolver: yupResolver(
      yup.object({
        email: yup.string().email(),
      }),
    ),
    defaultValues: {
      email: '',
    },
  });

  const isNonExistingUserError = !!formState.errors.email?.message?.match(
    NON_EXISTING_USER_ERROR_REGEX,
  );

  const organizerId = router.query.organizerId as string;

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: organizerId,
  });

  const organizer: Organizer = getOrganizerByIdQuery?.data;
  const organizerName =
    organizer?.name?.[i18n.language] ??
    organizer?.name?.[organizer.mainLanguage] ??
    organizer?.name;

  const getOwnershipRequestsQuery = useGetOwnershipRequestsQuery({
    itemId: organizerId,
  }) as UseQueryResult<GetOwnershipRequestsResponse, FetchError>;

  const getOwnershipCreatorQuery = useGetOwnershipCreatorQuery({
    organizerId: organizerId,
  });

  const requestsByState: Partial<Record<OwnershipState, OwnershipRequest[]>> =
    useMemo(
      () => groupBy(getOwnershipRequestsQuery.data?.member, 'state'),
      [getOwnershipRequestsQuery.data],
    );

  const creator = getOwnershipCreatorQuery.data;

  const approvedRequests = requestsByState[OwnershipState.APPROVED] ?? [];
  const pendingRequests = requestsByState[OwnershipState.REQUESTED] ?? [];

  const approveOwnershipRequestMutation = useApproveOwnershipRequestMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries('ownership-requests');
      setIsSuccessAlertVisible(true);
      setIsOpen(false);
      setIsQuestionModalVisible(false);
      setLastRequestedEmail(getValues('email'));
      reset();
    },
  });

  const requestOwnership = useRequestOwnershipMutation({
    onSuccess: (data: { id: string }) =>
      approveOwnershipRequestMutation.mutateAsync({ ownershipId: data.id }),
    onError: async (error: FetchError<ErrorBody>) => {
      if (error.body.status === 409) {
        const ownershipId = error.body.detail.split('with id ')[1];
        await approveOwnershipRequestMutation.mutateAsync({ ownershipId });
      } else {
        setError('email', { message: error.body.detail || error.title });
      }
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

  const handleConfirm = async () => {
    const isValid = await trigger();
    if (!isValid) return;

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
        return requestOwnership.mutate({
          ownerEmail: getValues('email'),
          itemId: parseOfferId(organizer['@id']),
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
                {t(`${translationsPath}.success`, {
                  ownerEmail:
                    selectedRequest?.ownerEmail ??
                    lastRequestedEmail ??
                    getValues('email'),
                  organizerName,
                })}
              </Alert>
            )}
            {(approvedRequests.length > 0 || !!creator) && (
              <Stack spacing={4}>
                <Title size={3}>{t('organizers.ownerships.owners')}</Title>
                <OwnershipsTable
                  requests={approvedRequests}
                  onDelete={setRequestToBeDeleted}
                  creator={creator}
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
                  <Box
                    padding={4}
                    dangerouslySetInnerHTML={{
                      __html: t('organizers.ownerships.delete_modal.body', {
                        ownerEmail: requestToBeDeleted?.ownerEmail,
                      }),
                    }}
                  />
                </Modal>
              </Stack>
            )}
            {pendingRequests.length > 0 && (
              <Stack spacing={4}>
                <Title size={3}>{t('organizers.ownerships.pending')}</Title>
                <OwnershipsTable
                  requests={pendingRequests}
                  onApprove={(request) => {
                    setIsQuestionModalVisible(true);
                    setSelectedRequest(request);
                    setActionType(ActionType.APPROVE);
                  }}
                  onReject={(request) => {
                    setIsQuestionModalVisible(true);
                    setSelectedRequest(request);
                    setActionType(ActionType.REJECT);
                  }}
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
                    {t(`${translationsPath}.body`, {
                      ownerEmail: selectedRequest?.ownerEmail,
                      organizerName,
                    })}
                  </Box>
                </Modal>
              </Stack>
            )}
          </Stack>
          <Stack spacing={3.5} flex={1}>
            <Button
              variant={ButtonVariants.PRIMARY}
              iconName={Icons.PLUS_CIRCLE}
              spacing={3}
              onClick={() => {
                setIsSuccessAlertVisible(false);
                setActionType(ActionType.REQUEST);
                setIsOpen(true);
              }}
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
          title={t('organizers.ownerships.request_modal.title', {
            name: organizerName,
          })}
          confirmTitle={t(
            'organizers.ownerships.request_modal.actions.confirm',
          )}
          cancelTitle={t('organizers.ownerships.request_modal.actions.cancel')}
          onConfirm={handleConfirm}
          onClose={() => setIsOpen(false)}
        >
          <Stack padding={4}>
            <FormElement
              id={'email'}
              Component={<Input type={'email'} {...register('email')} />}
              label={t('organizers.ownerships.request_modal.email')}
              error={
                formState.errors.email && (
                  <Trans
                    i18nKey={`organizers.ownerships.request_modal.${
                      isNonExistingUserError
                        ? 'email_not_known_error'
                        : 'email_error'
                    }`}
                    components={[
                      <Link
                        key="link"
                        href={`https://profile.uitid.be/${i18n.language}`}
                      >
                        Will be replaced
                      </Link>,
                    ]}
                  />
                )
              }
            />
          </Stack>
        </Modal>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    try {
      await Promise.all([
        prefetchGetOrganizerByIdQuery({
          req,
          queryClient,
          id: query.organizerId,
        }),
        prefetchGetOwnershipRequestsQuery({
          req,
          queryClient,
          itemId: query.organizerId,
        }),
        prefetchGetOwnershipCreatorQuery({
          req,
          queryClient,
          organizerId: query.organizerId,
        }),
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Ownership;
