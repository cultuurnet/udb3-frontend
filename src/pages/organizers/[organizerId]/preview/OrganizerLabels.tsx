import { uniq } from 'lodash';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';

import { ScopeTypes } from '@/constants/OfferType';
import { useGetLabelsByQuery } from '@/hooks/api/labels';
import {
  useAddOfferLabelMutation,
  useRemoveOfferLabelMutation,
} from '@/hooks/api/offers';
import { LABEL_PATTERN } from '@/pages/steps/AdditionalInformationStep/LabelsStep';
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
import { getUniqueLabels } from '@/utils/getUniqueLabels';

type OrganizerLabelProps = {
  organizer: Organizer;
};

export const OrganizerLabelsForm = ({ organizer }: OrganizerLabelProps) => {
  const { t } = useTranslation();
  const ref = useRef<TypeaheadElement<Label>>(null);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const labelsQuery: UseQueryResult<{ member: Label[] }> = useGetLabelsByQuery({
    query,
  });

  const scope = ScopeTypes.ORGANIZERS;
  const organizerId = router.query.organizerId as string;

  const options = labelsQuery.data?.member ?? [];
  const [labels, setLabels] = useState<string[]>(
    getUniqueLabels(organizer) ?? [],
  );
  const addLabelMutation = useAddOfferLabelMutation();
  const removeLabelMutation = useRemoveOfferLabelMutation();
  const getButtonValue = getValueFromTheme('button');

  const isWriting = addLabelMutation.isLoading || removeLabelMutation.isLoading;
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <Inline flex={1} spacing={5}>
      <Stack flex={1} opacity={isWriting ? 0.5 : 1} spacing={2}>
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
              onSearch={setQuery}
              onChange={async (newLabels: Label[]) => {
                const label = newLabels[0]?.name;
                if (!label || !label.match(LABEL_PATTERN)) {
                  return setIsInvalid(true);
                }

                setIsInvalid(false);
                await addLabelMutation.mutateAsync({
                  id: organizerId,
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
          {labels.map((label) => (
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
                    id: organizerId,
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
