import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { useGetOffersByCreatorQuery } from '@/hooks/api/offers';
import { useGetOrganizersByQueryQuery } from '@/hooks/api/organizers';
import { useGetUserQuery } from '@/hooks/api/user';
import { SupportedLanguages } from '@/i18n/index';
import { Organizer } from '@/types/Organizer';
import { Values } from '@/types/Values';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { ButtonCard } from '@/ui/ButtonCard';
import { CultuurKuurIcon } from '@/ui/CultuurKuurIcon';
import { FormElement } from '@/ui/FormElement';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { isNewEntry, NewEntry, Typeahead } from '@/ui/Typeahead';
import { UitpasIcon } from '@/ui/UitpasIcon';
import { CULTUURKUUR_ORGANIZER_LABEL } from '@/utils/hasCultuurkuurOrganizerLabel';
import { parseOfferId } from '@/utils/parseOfferId';
import { valueToArray } from '@/utils/valueToArray';

const MAX_RECENT_USED_ORGANIZERS = 4;

const getValueFromGlobalTheme = getValueFromTheme('global');

const isUitpasOrganizer = (organizer: Organizer) => {
  const combinedLabels = (organizer.labels || []).concat(
    organizer.hiddenLabels || [],
  );

  return combinedLabels.some(
    (label) =>
      (typeof label === 'string' && label.toLowerCase().includes('uitpas')) ||
      label.toLowerCase().includes('paspartoe'),
  );
};

const isCultuurkuurOrganizer = (organizer: Organizer): boolean => {
  return organizer.hiddenLabels?.includes(CULTUURKUUR_ORGANIZER_LABEL);
};

const RecentUsedOrganizers = ({
  organizers,
  onChange,
  ...props
}: {
  organizers: Organizer[];
  onChange: (organizerId: string) => void;
} & StackProps) => {
  const { t } = useTranslation();

  if (organizers.length === 0) {
    return null;
  }

  return (
    <Stack
      spacing={4}
      {...getStackProps(props)}
      css={`
        @media (max-resolution: 200dpi) {
          width: 100% !important;
        }
      `}
    >
      <Inline>
        <Text fontWeight="bold">
          {t(
            'create.additionalInformation.organizer.select_recent_used_organizer',
          )}
        </Text>
      </Inline>
      <Alert variant={AlertVariants.PRIMARY} width="41rem" maxWidth="95%">
        {t(
          'create.additionalInformation.organizer.select_recent_used_organizer_info',
        )}
      </Alert>
      <Inline spacing={4} justifyContent="flex-start" flexWrap="wrap">
        {organizers.map((organizer, index) => {
          const name =
            typeof organizer.name === 'string'
              ? organizer.name
              : organizer.name[organizer.mainLanguage];
          const address = organizer.address
            ? organizer.address.hasOwnProperty(organizer.mainLanguage)
              ? organizer.address[organizer.mainLanguage]
              : organizer.address
            : '';

          return (
            <ButtonCard
              key={index}
              onClick={() => onChange(parseOfferId(organizer['@id']))}
              title={name}
              hasEllipsisOnTitle={true}
              badge={
                <Inline>
                  {isUitpasOrganizer(organizer) && <UitpasIcon width="2rem" />}
                  {isCultuurkuurOrganizer(organizer) && (
                    <CultuurKuurIcon width="2rem" />
                  )}
                </Inline>
              }
              description={
                address && `${address.postalCode} ${address.addressLocality}`
              }
            />
          );
        })}
      </Inline>
    </Stack>
  );
};

type Props = Omit<StackProps, 'onChange'> & {
  organizer: Organizer;
  onChange: (organizerId: string) => void;
  onAddNewOrganizer: (organizer: NewEntry) => void;
  onDeleteOrganizer: (organizerId: string) => void;
};

export const getOrganizerName = (org: Organizer, language: string) =>
  (typeof org.name === 'string' ? org.name : org.name[language]) ??
  org.name[org.mainLanguage];

const OrganizerPicker = ({
  organizer,
  onChange,
  onAddNewOrganizer,
  onDeleteOrganizer,
  ...props
}: Props) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const getUserQuery = useGetUserQuery();
  const user = getUserQuery.data;

  const [addButtonHasBeenPressed, setAddButtonHasBeenPressed] = useState(false);
  const [organizerSearchInput, setOrganizerSearchInput] = useState('');

  // This is a random organizer with an ID to use as bridge when deleting dummy organizers
  const getRandomOrganizerQuery = useGetOrganizersByQueryQuery(
    {
      name: 'a',
      paginationOptions: { start: 0, limit: 1 },
    },
    {
      enabled: organizer && !organizer['@id'],
    },
  );

  const getOrganizersByQueryQuery = useGetOrganizersByQueryQuery(
    { name: organizerSearchInput },
    { enabled: !!organizerSearchInput },
  );

  const getOffersByCreatorQuery = useGetOffersByCreatorQuery({
    advancedQuery: '_exists_:organizer.id',
    creator: user,
    paginationOptions: { start: 0, limit: 20 },
  });

  const recentUsedOrganizers = useMemo(() => {
    const recentOrganizers = [];

    getOffersByCreatorQuery.data?.member.forEach((event) => {
      if (
        event.organizer &&
        !recentOrganizers.some(
          (recentOrganizer) =>
            recentOrganizer['@id'] === event.organizer['@id'],
        )
      )
        recentOrganizers.push(event.organizer);
    });

    return recentOrganizers.slice(0, MAX_RECENT_USED_ORGANIZERS);
  }, [getOffersByCreatorQuery.data?.member]);

  const organizers = getOrganizersByQueryQuery.data?.member ?? [];

  const handleSelectRecentOrganizer = (organizerId: string) => {
    onChange(organizerId);
    setAddButtonHasBeenPressed(false);
  };

  return (
    <Stack width="100%" {...getStackProps(props)}>
      <FormElement
        id="create-organizer"
        className="w-full"
        Component={
          organizer ? (
            <Stack>
              <Inline alignItems="center" paddingY={3} spacing={3}>
                <Icon
                  name={Icons.CHECK_CIRCLE}
                  color={getValueFromGlobalTheme('successColor')}
                />
                <Text>
                  {getOrganizerName(
                    organizer,
                    i18n.language as Values<typeof SupportedLanguages>,
                  )}
                </Text>
                <Button
                  spacing={3}
                  variant={ButtonVariants.LINK}
                  onClick={async () => {
                    let removed = organizer;

                    // If we have a dummy organizer, first set a real one
                    if (!organizer['@id']) {
                      removed = getRandomOrganizerQuery.data?.member[0];
                      await onChange(parseOfferId(removed?.['@id']));
                    }

                    onDeleteOrganizer(parseOfferId(removed['@id']));
                  }}
                >
                  {t('create.additionalInformation.organizer.change')}
                </Button>
              </Inline>
            </Stack>
          ) : (
            <Inline spacing={2} width="100%">
              <RecentUsedOrganizers
                organizers={recentUsedOrganizers}
                onChange={handleSelectRecentOrganizer}
                maxWidth="45rem"
              />
              <Stack width="100%">
                <Text fontWeight="bold" marginBottom={4}>
                  {recentUsedOrganizers.length > 0
                    ? t(
                        'create.additionalInformation.organizer.or_choose_other_organizer',
                      )
                    : t(
                        'create.additionalInformation.organizer.choose_other_organizer',
                      )}
                </Text>
                {!addButtonHasBeenPressed && (
                  <Button
                    alignSelf="flex-start"
                    variant={ButtonVariants.SECONDARY}
                    onClick={() => setAddButtonHasBeenPressed(true)}
                  >
                    {t('create.additionalInformation.organizer.add_new_button')}
                  </Button>
                )}
                {addButtonHasBeenPressed && (
                  <Typeahead<Organizer>
                    id={'organizer-picker'}
                    maxWidth="35rem"
                    options={organizers}
                    isLoading={getOrganizersByQueryQuery.isLoading}
                    labelKey={(org) => getOrganizerName(org, i18n.language)}
                    css={`
                      .dropdown-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                      }

                      .dropdown-item span:first-child {
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                      }
                    `}
                    renderMenuItemChildren={(org: Organizer, { text }) => {
                      const name = getOrganizerName(org, i18n.language);

                      return (
                        <>
                          <Text>
                            <Highlighter search={text}>{name}</Highlighter>
                          </Text>
                          <Inline spacing={2}>
                            {isUitpasOrganizer(org) && (
                              <UitpasIcon width="2rem" />
                            )}
                            {isCultuurkuurOrganizer(org) && (
                              <CultuurKuurIcon width="2rem" />
                            )}
                          </Inline>
                        </>
                      );
                    }}
                    selected={valueToArray(organizer)}
                    onInputChange={debounce(setOrganizerSearchInput, 275)}
                    onChange={(organizers) => {
                      const organizer = organizers[0];

                      if (isNewEntry(organizer)) {
                        onAddNewOrganizer(organizer);
                        queryClient.invalidateQueries('organizers');
                        return;
                      }

                      onChange(parseOfferId(organizer['@id']));
                    }}
                    minLength={3}
                    newSelectionPrefix={t(
                      'create.additionalInformation.organizer.add_new_label',
                    )}
                    allowNew
                    flex={'initial'}
                  />
                )}
              </Stack>
            </Inline>
          )
        }
      />
    </Stack>
  );
};

export { isUitpasOrganizer, OrganizerPicker };
