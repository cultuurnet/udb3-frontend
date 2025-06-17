import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient, UseQueryResult } from 'react-query';

import { useRequestOwnershipMutation } from '@/hooks/api/ownerships';
import { useGetUserQuery, User } from '@/hooks/api/user';
import { SupportedLanguage } from '@/i18n/index';
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { FetchError } from '@/utils/fetchFromApi';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { parseOfferId } from '@/utils/parseOfferId';

type Props = {
  organizer: Organizer;
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: () => void;
};

const RequestOwnershipModal = ({
  organizer,
  isVisible,
  onClose,
  onSuccess,
  onError,
}: Props) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const organizerId =
    (router.query.organizerId as string) ??
    parseOfferId(organizer?.['@id'] ?? '');
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);

  const organizerName: string = getLanguageObjectOrFallback(
    organizer?.name,
    i18n.language as SupportedLanguage,
    organizer?.mainLanguage as SupportedLanguage,
  );

  const getUserQuery = useGetUserQuery() as UseQueryResult<User, FetchError>;

  const userId = getUserQuery.data?.sub;

  const requestOwnershipMutation = useRequestOwnershipMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries('ownership-requests');
      onClose();
      setIsSuccessAlertVisible(true);
      if (onSuccess) onSuccess();
    },
    onError: () => {
      onClose();
      setIsErrorAlertVisible(true);
      if (onError) onError();
    },
  });

  return (
    <>
      <Modal
        title={t('organizers.ownerships.request.confirm_modal.title', {
          organizerName,
        })}
        confirmTitle={t('organizers.ownerships.request.confirm_modal.confirm')}
        cancelTitle={t('organizers.ownerships.request.confirm_modal.cancel')}
        visible={isVisible}
        variant={ModalVariants.QUESTION}
        onClose={onClose}
        onConfirm={() => {
          requestOwnershipMutation.mutate({
            itemId: organizerId,
            ownerId: userId,
          });
        }}
        size={ModalSizes.MD}
      >
        <Box
          padding={4}
          dangerouslySetInnerHTML={{
            __html: t('organizers.ownerships.request.confirm_modal.body', {
              organizerName,
            }),
          }}
        />
      </Modal>
      {isSuccessAlertVisible && (
        <Alert
          variant={AlertVariants.SUCCESS}
          marginBottom={4}
          closable
          fullWidth
          onClose={() => setIsSuccessAlertVisible(false)}
        >
          {t('organizers.ownerships.request.success', { organizerName })}
        </Alert>
      )}
      {isErrorAlertVisible && (
        <Alert
          variant={AlertVariants.DANGER}
          marginBottom={4}
          fullWidth
          closable
          onClose={() => setIsErrorAlertVisible(false)}
        >
          {t('organizers.ownerships.request.confirm_modal.error')}
        </Alert>
      )}
    </>
  );
};

export { RequestOwnershipModal };
