import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDeleteRoleMutation } from '@/hooks/api/roles';
import { Role } from '@/types/Role';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box } from '@/ui/Box';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';

type DeleteRoleModalProps = {
  role: Role | null;
  onClose: () => void;
  onDeleted: (roleName: string) => void;
};

export const DeleteRoleModal = ({
  role,
  onClose,
  onDeleted,
}: DeleteRoleModalProps) => {
  const { t } = useTranslation();
  const [deleteError, setDeleteError] = useState('');

  const deleteRoleMutation = useDeleteRoleMutation({
    onSuccess: () => {
      const roleName = role?.name || '';
      onDeleted(roleName);
      handleClose();
    },
    onError: () => {
      setDeleteError(t('roles.overview.delete.error'));
    },
  });

  const handleClose = () => {
    setDeleteError('');
    onClose();
  };

  const handleConfirm = () => {
    if (role) {
      setDeleteError('');
      deleteRoleMutation.mutate({ id: role.uuid });
    }
  };

  return (
    <Modal
      variant={ModalVariants.QUESTION}
      visible={!!role}
      title={t('roles.overview.delete.title')}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmTitle={t('roles.overview.delete.confirm')}
      cancelTitle={t('roles.overview.delete.cancel')}
      confirmLoading={deleteRoleMutation.isPending}
      size={ModalSizes.MD}
    >
      <Box padding={4}>
        <Stack spacing={4}>
          <Text>
            {t('roles.overview.delete.message', { name: role?.name })}
          </Text>
          {deleteError && (
            <Alert variant={AlertVariants.DANGER} fullWidth={true}>
              {deleteError}
            </Alert>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};
