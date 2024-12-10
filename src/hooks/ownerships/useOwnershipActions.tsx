import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { useGetOrganizerByIdQuery } from '@/hooks/api/organizers';
import {
  OwnershipRequest,
  useApproveOwnershipRequestMutation,
  useDeleteOwnershipRequestMutation,
  useRejectOwnershipRequestMutation,
} from '@/hooks/api/ownerships';
import { Organizer } from '@/types/Organizer';
import { Values } from '@/types/Values';
import { Box } from '@/ui/Box';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';

export const ActionType = {
  APPROVE: 'confirm',
  REJECT: 'reject',
  REQUEST: 'request',
  DELETE: 'delete',
} as const;

type ActionType = Values<typeof ActionType>;

const OwnershipActionModal = ({
  request,
  actionType,
  onConfirm,
  onClose,
  isLoading,
}: {
  request?: OwnershipRequest;
  actionType: ActionType;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const translationsPath = `organizers.ownerships.${actionType}_modal`;

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: request?.itemId,
  });

  // @ts-expect-error
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

export const useOwnershipActions = () => {
  const queryClient = useQueryClient();

  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OwnershipRequest>();
  const [actionType, setActionType] = useState<ActionType>();

  const approveOwnershipRequestMutation = useApproveOwnershipRequestMutation({
    onSuccess: async () => {
      setIsSuccessAlertVisible(true);
      setActionType(undefined);
      setSelectedRequest(undefined);
      await queryClient.invalidateQueries('ownership-requests');
    },
  });

  const rejectOwnershipRequestMutation = useRejectOwnershipRequestMutation({
    onSuccess: async () => {
      setIsSuccessAlertVisible(true);
      setActionType(undefined);
      setSelectedRequest(undefined);
      await queryClient.invalidateQueries('ownership-requests');
    },
  });

  const deleteOwnershipRequestMutation = useDeleteOwnershipRequestMutation({
    onSuccess: async () => {
      setActionType(undefined);
      setSelectedRequest(undefined);
      await queryClient.invalidateQueries('ownership-requests');
    },
  });

  const isLoading =
    approveOwnershipRequestMutation.isLoading ||
    rejectOwnershipRequestMutation.isLoading ||
    deleteOwnershipRequestMutation.isLoading;

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

  return {
    deleteOwnership: (request: OwnershipRequest) => {
      setActionType(ActionType.DELETE);
      setSelectedRequest(request);
    },
    Modal: () => {
      return (
        <OwnershipActionModal
          request={selectedRequest}
          actionType={actionType}
          isLoading={isLoading}
          onClose={() => setSelectedRequest(undefined)}
          onConfirm={handleConfirm}
        />
      );
    },
    Alert: () => (isSuccessAlertVisible ? <Alert>test</Alert> : null),
  };
};
