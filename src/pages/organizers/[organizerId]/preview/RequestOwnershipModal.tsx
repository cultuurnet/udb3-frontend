import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Box } from '@/ui/Box';
import { Trans, useTranslation } from 'react-i18next';
import { useQueryClient, UseQueryResult } from 'react-query';
import { useRouter } from 'next/router';
import { FetchError } from '@/utils/fetchFromApi';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { SupportedLanguage } from '@/i18n/index';
import { useGetUserQuery, User } from '@/hooks/api/user';
import { useRequestOwnershipMutation } from '@/hooks/api/ownerships';
import { Organizer } from '@/types/Organizer';
import { bool } from 'yup';

type Props = {
  organizer: Organizer;
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
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
  const organizerId = router.query.organizerId as string;

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
      onSuccess();
    },
    onError: onError,
  });

  return (
    <Modal
      title={t('organizers.ownerships.request.confirm_modal.title', {
        organizerName: organizerName,
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
      <Box padding={4}>
        <Trans
          i18nKey="organizers.ownerships.request.confirm_modal.body"
          values={{
            organizerName: organizerName,
          }}
        />
      </Box>
    </Modal>
  );
};

export { RequestOwnershipModal };
