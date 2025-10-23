import { useTranslation } from 'react-i18next';

import { useGetRoleLabelsQuery } from '@/hooks/api/roles';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

interface LabelsSectionProps {
  roleId: string;
}

export const LabelsSection = ({ roleId }: LabelsSectionProps) => {
  const { t } = useTranslation();
  const getGlobalValue = getValueFromTheme('global');

  const { data: labels } = useGetRoleLabelsQuery(roleId);

  console.table(labels);

  // TODO: Implement label management logic
  // This would use useGetRoleLabelsQuery, useAddLabelToRoleMutation, useRemoveLabelFromRoleMutation
  // and potentially reuse the label search component from the existing labels implementation

  return (
    <Stack
      backgroundColor="white"
      padding={4}
      borderRadius={getGlobalBorderRadius}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
        border-top-left-radius: 0;
      `}
    >
      <Text>
        {t('roles.form.labels.placeholder_message')} (Role ID: {roleId})
      </Text>
    </Stack>
  );
};
