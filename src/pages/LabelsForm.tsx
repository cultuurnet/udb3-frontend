import { uniq } from 'lodash';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Scope } from '@/constants/OfferType';
import { useGetLabelsByQuery } from '@/hooks/api/labels';
import {
  useAddOfferLabelMutation,
  useRemoveOfferLabelMutation,
} from '@/hooks/api/offers';
import { useGetPermissionsQuery } from '@/hooks/api/user';
import { Label, Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { Alert } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';
import { Typeahead, TypeaheadElement } from '@/ui/Typeahead';
import { displayCultuurkuurLabels } from '@/utils/displayCultuurkuurLabels';
import { getUniqueLabels } from '@/utils/getUniqueLabels';

import { LABEL_PATTERN } from './steps/AdditionalInformationStep/LabelsStep';

type Props = {
  scope: Scope;
  id: string;
  entity?: Organizer | Offer;
};

const LabelsForm = ({ scope, id, entity }: Props) => {
  const { t } = useTranslation();

  const ref = useRef<TypeaheadElement<Label>>(null);
  const [name, setName] = useState('');
  const labelsQuery = useGetLabelsByQuery({
    name,
    onlySuggestions: true,
  });

  const options = labelsQuery.data?.member ?? [];
  const [labels, setLabels] = useState<string[]>(getUniqueLabels(entity) ?? []);

  const getPermissionsQuery = useGetPermissionsQuery();
  const permissions = getPermissionsQuery.data;
  const labelsToShow = displayCultuurkuurLabels(permissions, labels);

  const addLabelMutation = useAddOfferLabelMutation();
  const removeLabelMutation = useRemoveOfferLabelMutation();
  const getButtonValue = getValueFromTheme('button');

  const isWriting = addLabelMutation.isPending || removeLabelMutation.isPending;
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <Inline flex={1} spacing={5}>
      <Stack flex={1} opacity={isWriting ? 0.5 : 1} spacing={4}>
        <FormElement
          id={'labels-picker'}
          label={
            <Text
              fontSize="0.8rem"
              fontWeight="normal"
              variant={TextVariants.MUTED}
            >
              {t('create.additionalInformation.labels.info')}
            </Text>
          }
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
              onSearch={setName}
              onChange={async (newLabels: Label[]) => {
                const label = newLabels[0]?.name;
                if (!label || !label.match(LABEL_PATTERN)) {
                  return setIsInvalid(true);
                }

                setIsInvalid(false);
                await addLabelMutation.mutateAsync({
                  id,
                  scope,
                  label,
                });

                setLabels(uniq([...labels, label]));
                ref.current.clear();
              }}
            />
          }
          maxWidth={'100%'}
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
                    id,
                    scope,
                    label,
                  });

                  setLabels(
                    labels.filter((existingLabel) => label !== existingLabel),
                  );
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
};

export { LabelsForm };
