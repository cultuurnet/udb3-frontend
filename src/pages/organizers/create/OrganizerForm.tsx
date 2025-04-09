import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import * as yup from 'yup';

import { ScopeTypes } from '@/constants/OfferType';
import { URL_REGEX } from '@/constants/Regex';
import {
  useAddOfferLabelMutation,
  useRemoveOfferLabelMutation,
} from '@/hooks/api/offers';
import {
  useCreateOrganizerMutation,
  useGetOrganizerByIdQuery,
  useUpdateOrganizerMutation,
} from '@/hooks/api/organizers';
import { SupportedLanguage, SupportedLanguages } from '@/i18n/index';
import { parseLocationAttributes } from '@/pages/create/OfferForm';
import {
  additionalInformationStepConfiguration,
  AdditionalInformationStepVariant,
} from '@/pages/steps/AdditionalInformationStep';
import { useParseStepConfiguration } from '@/pages/steps/hooks/useParseStepConfiguration';
import { locationStepConfiguration } from '@/pages/steps/LocationStep';
import { Steps, StepsConfiguration } from '@/pages/steps/Steps';
import { Organizer } from '@/types/Organizer';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Link, LinkVariants } from '@/ui/Link';
import { Page } from '@/ui/Page';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { getUniqueLabels } from '@/utils/getUniqueLabels';

import { NameAndUrlStep } from './steps/NameAndUrlStep';
import { hasCultuurkuurOrganizerLabel } from '@/utils/hasCultuurkuurOrganizerLabel';

const CULTUURKUUR_ORGANIZER_LABEL = 'cultuurkuur_organizer';

const typeAndThemeStepConfiguration: StepsConfiguration<'nameAndUrl'> = {
  Component: NameAndUrlStep,
  name: 'nameAndUrl',
  title: ({ t }) => t('organizers.create.step1.title'),
  shouldShowStep: () => true,
  defaultValue: {
    name: '',
    url: '',
    isContactUrl: true,
    isCultuurkuur: false,
  },
  validation: yup.object({
    name: yup.string().required(),
    url: yup.string().matches(URL_REGEX).required(),
    isCultuurkuur: yup.boolean().required(),
  }),
};

const getValue = getValueFromTheme('createPage');

const configurations = [
  typeAndThemeStepConfiguration,
  {
    ...additionalInformationStepConfiguration,
    shouldShowStep: (form) =>
      form.offerId &&
      form.getValues('nameAndUrl.name') &&
      form.getValues('nameAndUrl.url') &&
      form.getValues('nameAndUrl.cultuurkuur'),
    variant: AdditionalInformationStepVariant.ORGANIZER,
    name: 'location' as StepsConfiguration['name'],
    defaultValue: locationStepConfiguration.defaultValue,
    validation: locationStepConfiguration.validation,
  },
];

const OrganizerForm = () => {
  const scope = ScopeTypes.ORGANIZERS;
  const { form } = useParseStepConfiguration(configurations);
  const { t, i18n } = useTranslation();
  const { push, query } = useRouter();

  const { handleSubmit, formState, getValues, reset } = form;

  const urlOrganizerId = useMemo(
    () => query.organizerId as string,
    [query.organizerId],
  );

  const convertOrganizerToFormData = (organizer: Organizer) => {
    const isCultuurkuurOrganizer = hasCultuurkuurOrganizerLabel(
      organizer?.hiddenLabels,
    );
    const locationAttributes = !organizer?.address
      ? {}
      : parseLocationAttributes(
          organizer,
          i18n.language as SupportedLanguage,
          organizer.mainLanguage as SupportedLanguage,
        );

    return {
      nameAndUrl: {
        name: getLanguageObjectOrFallback(
          organizer.name,
          i18n.language as SupportedLanguage,
        ) as string,
        url: organizer.url,
        isCultuurkuur: isCultuurkuurOrganizer,
      },
      ...locationAttributes,
    };
  };

  // TODO better type query
  const getOrganizerByIdQuery = useGetOrganizerByIdQuery(
    { id: urlOrganizerId },
    {
      onSuccess: (organizer: Organizer) => {
        reset(convertOrganizerToFormData(organizer), {
          keepDirty: true,
        });
      },
    },
  );

  const organizer = getOrganizerByIdQuery?.data;
  const organizerLabels = getUniqueLabels(organizer);

  const queryClient = useQueryClient();
  const createOrganizerMutation = useCreateOrganizerMutation();
  const updateOrganizerMutation = useUpdateOrganizerMutation();
  const addLabelMutation = useAddOfferLabelMutation();
  const removeLabelMutation = useRemoveOfferLabelMutation();

  const handleCultuurkuurLabelMutation = async (organizerId: string) => {
    const { isCultuurkuur } = getValues('nameAndUrl');
    const mutation = isCultuurkuur ? addLabelMutation : removeLabelMutation;
    await mutation.mutateAsync({
      id: organizerId,
      scope,
      label: CULTUURKUUR_ORGANIZER_LABEL,
    });
    await queryClient.invalidateQueries('organizers');
  };

  const upsertOrganizer = async ({ onSuccess }) => {
    let mutation = createOrganizerMutation;
    const { name, url, isContactUrl } = getValues('nameAndUrl');
    let attributes: { [key: string]: any } = {
      name,
      url,
      mainLanguage: i18n.language,
    };

    if (urlOrganizerId) {
      mutation = updateOrganizerMutation;
      attributes = { ...attributes, organizerId: urlOrganizerId };
    } else if (isContactUrl) {
      attributes.contactPoint = { url: [url] };
    }

    const response = await mutation.mutateAsync(attributes);

    if (!urlOrganizerId) {
      onSuccess(response.organizerId);
    }
  };

  const hasErrors = Object.keys(formState.errors).length > 0;

  const onSuccess = () => {
    upsertOrganizer({
      onSuccess: async (organizerId: string) => {
        await handleCultuurkuurLabelMutation(organizerId);
        await push(`/organizers/${organizerId}/edit`);
      },
    });
  };

  return (
    <Page>
      <Page.Title spacing={3} alignItems="center">
        {t('organizers.create.title')}
      </Page.Title>
      <Page.Content spacing={5} alignItems="flex-start">
        <Steps
          scope={scope}
          offerId={urlOrganizerId}
          mainLanguage={SupportedLanguages.NL}
          configurations={configurations}
          form={form}
          labels={organizerLabels}
          onChange={async () => {
            if (urlOrganizerId) {
              onSuccess();
              await handleCultuurkuurLabelMutation(urlOrganizerId);
            }
          }}
        />
      </Page.Content>
      <Page.Footer>
        {urlOrganizerId ? (
          <Inline spacing={3} alignItems="center">
            <Link
              href={`/organizer/${urlOrganizerId}/preview`}
              variant={LinkVariants.BUTTON_SUCCESS}
            >
              <Text>{t('create.footer.done_editing')}</Text>
            </Link>
            <Text color={getValue('footer.color')} fontSize="0.9rem">
              {t('create.footer.auto_save')}
            </Text>
          </Inline>
        ) : (
          <Button
            disabled={hasErrors || !formState.isDirty}
            variant={ButtonVariants.PRIMARY}
            onClick={handleSubmit(onSuccess)}
          >
            {t('organizers.create.step1.save')}
          </Button>
        )}
      </Page.Footer>
    </Page>
  );
};

export { OrganizerForm };
