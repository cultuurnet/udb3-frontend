import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  GetOrganizerByIdResponse,
  useGetOrganizerByIdQuery,
} from '@/hooks/api/organizers';
import {
  OwnershipRequest,
  useApproveOwnershipRequestMutation,
  useDeleteOwnershipRequestMutation,
  useRejectOwnershipRequestMutation,
} from '@/hooks/api/ownerships';
import { Organizer } from '@/types/Organizer';
import { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { getInlineProps, InlineProps } from '@/ui/Inline';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';

export const ActionType = {
  APPROVE: 'approve',
  REJECT: 'reject',
  REQUEST: 'request',
  DELETE: 'delete',
} as const;

export type ActionType = Values<typeof ActionType>;

const OwnershipActionsAlert = ({
  request,
  actionType,
  onClose,
  ...props
}: {
  request: OwnershipRequest;
  actionType: ActionType;
  onClose: () => void;
} & InlineProps) => {
  const { i18n } = useTranslation();

  const translationsPath = `organizers.ownerships.${actionType}_modal`;

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: request?.itemId,
  }) as UseQueryResult<GetOrganizerByIdResponse>;

  const organizer = getOrganizerByIdQuery?.data;
  const organizerName =
    organizer?.name?.[i18n.language] ??
    organizer?.name?.[organizer.mainLanguage] ??
    organizer?.name;

  if (getOrganizerByIdQuery.isLoading) {
    return null;
  }

  return (
    <Alert
      variant={AlertVariants.SUCCESS}
      fullWidth
      closable
      onClose={onClose}
      {...getInlineProps(props)}
    >
      <Trans
        i18nKey={`${translationsPath}.success`}
        values={{
          ownerEmail: request?.ownerEmail,
          organizerName,
        }}
      />
    </Alert>
  );
};

const OwnershipActionModal = ({
  request,
  actionType,
  onConfirm,
  onClose,
  isLoading,
}: {
  request: OwnershipRequest | undefined;
  actionType: ActionType;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const translationsPath = `organizers.ownerships.${actionType}_modal`;

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery(
    {
      id: request?.itemId,
    },
    {
      // This is needed if the filtered organizer is the same as the one from the action
      // otherwise the query in the action will trigger the query on the page continuously
      queryKey: ['organizers', 'action-modal'],
    },
  ) as UseQueryResult<GetOrganizerByIdResponse>;

  const organizer: Organizer = getOrganizerByIdQuery?.data;
  const organizerName =
    organizer?.name?.[i18n.language] ??
    organizer?.name?.[organizer.mainLanguage] ??
    organizer?.name;

  return (
    <Modal
      title={t(`${translationsPath}.title`)}
      confirmTitle={t(`${translationsPath}.confirm`)}
      cancelTitle={t(`${translationsPath}.cancel`)}
      visible={!!request && !isLoading}
      variant={ModalVariants.QUESTION}
      onConfirm={onConfirm}
      onClose={onClose}
      size={ModalSizes.MD}
    >
      <Box padding={4}>
        <Trans
          i18nKey={`${translationsPath}.body`}
          values={{
            ownerEmail: request?.ownerEmail,
            organizerName,
          }}
        />
      </Box>
    </Modal>
  );
};

// TODO: Use this hook on src/pages/organizers/[organizerId]/ownerships/index.page.tsx
export const useOwnershipActions = () => {
  const queryClient = useQueryClient();

  const [selectedRequest, setSelectedRequest] = useState<OwnershipRequest>();
  const [actionType, setActionType] = useState<ActionType>();
  const [successfulAction, setSuccessfulAction] = useState<{
    request: OwnershipRequest;
    actionType: ActionType;
  }>();

  const triggerSuccess = (actionType: ActionType) => async () => {
    setSuccessfulAction({
      request: selectedRequest,
      actionType,
    });
    setActionType(undefined);
    setSelectedRequest(undefined);
    await queryClient.invalidateQueries({ queryKey: ['ownership-requests'] });
  };

  const approveOwnershipRequestMutation = useApproveOwnershipRequestMutation({
    onSuccess: triggerSuccess(ActionType.APPROVE),
  });

  const rejectOwnershipRequestMutation = useRejectOwnershipRequestMutation({
    onSuccess: triggerSuccess(ActionType.REJECT),
  });

  const deleteOwnershipRequestMutation = useDeleteOwnershipRequestMutation({
    onSuccess: triggerSuccess(ActionType.DELETE),
  });

  const isLoading =
    approveOwnershipRequestMutation.isPending ||
    rejectOwnershipRequestMutation.isPending ||
    deleteOwnershipRequestMutation.isPending;

  const handleConfirm = () => {
    if (actionType === ActionType.APPROVE) {
      return approveOwnershipRequestMutation.mutate({
        ownershipId: selectedRequest.id,
      });
    }

    if (actionType === ActionType.REJECT) {
      return rejectOwnershipRequestMutation.mutate({
        ownershipId: selectedRequest.id,
      });
    }

    if (actionType === ActionType.DELETE) {
      return deleteOwnershipRequestMutation.mutate({
        ownershipId: selectedRequest.id,
      });
    }
  };

  const triggerAction =
    (actionType: ActionType) => (request: OwnershipRequest) => {
      setActionType(actionType);
      setSelectedRequest(request);
    };

  return {
    deleteOwnership: triggerAction(ActionType.DELETE),
    approveOwnership: triggerAction(ActionType.APPROVE),
    rejectOwnership: triggerAction(ActionType.REJECT),
    Modal: () => (
      <OwnershipActionModal
        request={selectedRequest}
        actionType={actionType}
        isLoading={isLoading}
        onClose={() => setSelectedRequest(undefined)}
        onConfirm={handleConfirm}
      />
    ),
    Alert: (props: InlineProps) =>
      successfulAction ? (
        <OwnershipActionsAlert
          request={successfulAction.request}
          actionType={successfulAction.actionType}
          onClose={() => {
            setSuccessfulAction(undefined);
            setSelectedRequest(undefined);
            setActionType(undefined);
          }}
          {...getInlineProps(props)}
        />
      ) : null,
  };
};
