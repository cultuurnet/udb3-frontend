import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetLabelsByQuery } from '@/hooks/api/labels';
import {
  useAddLabelToRoleMutation,
  useGetRoleLabelsQuery,
  useRemoveLabelFromRoleMutation,
} from '@/hooks/api/roles';
import { LABEL_PATTERN } from '@/pages/steps/AdditionalInformationStep/LabelsStep';
import { Label } from '@/types/Offer';
import { Alert } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { Typeahead, TypeaheadElement } from '@/ui/Typeahead';

interface LabelsSectionProps {
  roleId: string;
}

export const LabelsSection = ({ roleId }: LabelsSectionProps) => {
  const { t } = useTranslation();
  const getGlobalValue = getValueFromTheme('global');
  const getTabsValue = getValueFromTheme('tabs');
  const ref = useRef<TypeaheadElement<Label>>(null);

  const [name, setName] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const labelsQuery = useGetLabelsByQuery({
    name,
    onlySuggestions: true,
  });

  const { data: labels } = useGetRoleLabelsQuery(roleId);

  const addLabelMutation = useAddLabelToRoleMutation();
  const removeLabelMutation = useRemoveLabelFromRoleMutation();

  const getButtonValue = getValueFromTheme('button');
  const options = useMemo(
    () => labelsQuery.data?.member ?? [],
    [labelsQuery.data?.member],
  );
  const isWriting = addLabelMutation.isPending || removeLabelMutation.isPending;

  const labelsToShow: string[] = labels
    ? labels.map((label) => label.name)
    : [];

  const onLabelSelect = useCallback(
    async (newLabels: Label[]) => {
      const label = newLabels[0]?.name;
      if (!label || !label.match(LABEL_PATTERN)) {
        return setIsInvalid(true);
      }

      setIsInvalid(false);

      const existingLabel = options.find((option) => option.name === label);
      const labelId = existingLabel?.uuid || label;

      await addLabelMutation.mutateAsync({
        roleId,
        labelId,
      });

      ref.current?.clear();
    },
    [addLabelMutation, options, roleId],
  );

  const onLabelRemove = useCallback(
    (labelName: string) => async () => {
      const labelToRemove = labels?.find((l) => l.name === labelName);
      if (labelToRemove) {
        await removeLabelMutation.mutateAsync({
          roleId,
          labelId: labelToRemove.uuid,
        });
      }
    },
    [labels, removeLabelMutation, roleId],
  );

  return (
    <Stack
      className="role-labels-section"
      backgroundColor="white"
      padding={4}
      borderRadius={getGlobalBorderRadius}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
        border-top-left-radius: 0;
        border: 1px solid ${getTabsValue('borderColor')};
        margin-top: -1px;
      `}
    >
      <Inline flex={1} spacing={5}>
        <Stack flex={1} opacity={isWriting ? 0.5 : 1} spacing={2}>
          <FormElement
            id={'labels-picker'}
            width={'50%'}
            label={t('roles.form.labels.label')}
            error={
              isInvalid
                ? t('create.additionalInformation.labels.error')
                : undefined
            }
            Component={
              <Typeahead
                ref={ref}
                name={'labels'}
                isInvalid={isInvalid}
                isLoading={labelsQuery.isLoading || addLabelMutation.isPending}
                options={options}
                labelKey={'name'}
                allowNew
                newSelectionPrefix={t(
                  'create.additionalInformation.labels.add_new_label',
                )}
                onSearch={setName}
                onChange={onLabelSelect}
              />
            }
            maxWidth={'100%'}
            info={
              <Text variant={TextVariants.MUTED}>
                {t('create.additionalInformation.labels.info')}
              </Text>
            }
          />
          <Inline
            className={'picked-labels'}
            marginTop={4}
            spacing={3}
            flexWrap="wrap"
          >
            {labelsToShow.map((label) => (
              <Inline
                key={label}
                borderRadius={getGlobalBorderRadius}
                cursor={'pointer'}
                display={'flex'}
                marginBottom={3}
                paddingY={3}
                paddingX={3}
                color={getButtonValue('secondaryToggle.color')}
                fontWeight="400"
                fontSize="0.85rem"
                css={`
                  border: 1px solid
                    ${getButtonValue('secondaryToggle.borderColor')};
                `}
              >
                <Text>{label}</Text>
                <Icon
                  name={Icons.TIMES}
                  width="0.8rem"
                  height="0.8rem"
                  marginLeft={1}
                  onClick={onLabelRemove(label)}
                />
              </Inline>
            ))}
          </Inline>
        </Stack>
        {isInvalid && (
          <Alert>{t('create.additionalInformation.labels.tips')}</Alert>
        )}
      </Inline>
    </Stack>
  );
};
