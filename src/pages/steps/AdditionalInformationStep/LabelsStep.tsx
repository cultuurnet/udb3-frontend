import { uniq } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient, UseQueryResult } from 'react-query';

import { ScopeTypes } from '@/constants/OfferType';
import { useGetLabelsByQuery } from '@/hooks/api/labels';
import {
  useAddOfferLabelMutation,
  useRemoveOfferLabelMutation,
} from '@/hooks/api/offers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { useGetPermissionsQuery, useGetRolesQuery } from '@/hooks/api/user';
import {
  TabContentProps,
  ValidationStatus,
} from '@/pages/steps/AdditionalInformationStep/AdditionalInformationStep';
import { Label, Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { Alert } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { Typeahead, TypeaheadElement } from '@/ui/Typeahead';
import { displayCultuurkuurLabels } from '@/utils/displayCultuurkuurLabels';
import { getUniqueLabels } from '@/utils/getUniqueLabels';

type LabelsStepProps = StackProps & TabContentProps;

export const LABEL_PATTERN = /^[0-9a-zA-ZÀ-ÿ][0-9a-zA-ZÀ-ÿ\-_\s]{1,49}$/;

const getGlobalValue = getValueFromTheme('global');
const getButtonValue = getValueFromTheme('button');

function LabelsStep({
  offerId,
  scope,
  field,
  onValidationChange,
  ...props
}: LabelsStepProps) {
  const { t } = useTranslation();

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });
  const entity: Offer | Organizer | undefined = getEntityByIdQuery.data;

  const ref = useRef<TypeaheadElement<Label>>(null);

  const [query, setQuery] = useState('');
  const labelsQuery: UseQueryResult<{ member: Label[] }> = useGetLabelsByQuery({
    query,
  });

  const options = labelsQuery.data?.member ?? [];
  const [labels, setLabels] = useState<string[]>(getUniqueLabels(entity) ?? []);
  const addLabelMutation = useAddOfferLabelMutation();
  const removeLabelMutation = useRemoveOfferLabelMutation();

  const queryClient = useQueryClient();

  const getPermissionsQuery = useGetPermissionsQuery();
  const permissions = getPermissionsQuery.data;
  const labelsToShow = displayCultuurkuurLabels(permissions, labels);

  useEffect(() => {
    onValidationChange(
      labels.length ? ValidationStatus.SUCCESS : ValidationStatus.NONE,
      field,
    );
  }, [field, labels, onValidationChange]);

  useEffect(() => {
    setLabels(getUniqueLabels(entity));
  }, [entity]);

  const isWriting = addLabelMutation.isLoading || removeLabelMutation.isLoading;
  const [isInvalid, setIsInvalid] = useState(false);

  const handleInvalidateOrganizerQuery = async () => {
    if (scope !== ScopeTypes.ORGANIZERS) return;
    await queryClient.invalidateQueries('organizers');
  };

  return (
    <Inline width={isInvalid ? '100%' : '50%'} spacing={5}>
      <Stack
        flex={1}
        {...getStackProps(props)}
        opacity={isWriting ? 0.5 : 1}
        spacing={2}
      >
        <FormElement
          id={'labels-picker'}
          label={t('create.additionalInformation.labels.label')}
          loading={isWriting}
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
              isLoading={labelsQuery.isLoading}
              options={options}
              labelKey={'name'}
              allowNew
              newSelectionPrefix={t(
                'create.additionalInformation.labels.add_new_label',
              )}
              onSearch={setQuery}
              onChange={async (newLabels: Label[]) => {
                const label = newLabels[0]?.name;
                if (!label || !label.match(LABEL_PATTERN)) {
                  return setIsInvalid(true);
                }

                setIsInvalid(false);
                await addLabelMutation.mutateAsync({
                  id: offerId,
                  scope,
                  label,
                });

                setLabels(uniq([...labels, label]));
                handleInvalidateOrganizerQuery();
                ref.current.clear();
              }}
            />
          }
          maxWidth={'100%'}
          info={
            <Text variant={TextVariants.MUTED}>
              {t('create.additionalInformation.labels.info')}
            </Text>
          }
        />
        <Inline spacing={3} flexWrap="wrap">
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
                onClick={async () => {
                  await removeLabelMutation.mutateAsync({
                    id: offerId,
                    scope,
                    label,
                  });

                  setLabels(
                    labels.filter((existingLabel) => label !== existingLabel),
                  );
                  handleInvalidateOrganizerQuery();
                }}
              />
            </Inline>
          ))}
        </Inline>
      </Stack>
      {isInvalid && (
        <Alert>{t('create.additionalInformation.labels.tips')}</Alert>
      )}
    </Inline>
  );
}

export { LabelsStep };
