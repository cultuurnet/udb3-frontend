import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { OfferTypes } from '@/constants/OfferType';
import { useGetEventByIdQuery } from '@/hooks/api/events';
import {
  useAddOfferOrganizerMutation,
  useDeleteOfferOrganizerMutation,
} from '@/hooks/api/offers';
import { useCreateOrganizerMutation } from '@/hooks/api/organizers';
import { useGetPlaceByIdQuery } from '@/hooks/api/places';
import {
  CardSystem,
  useAddCardSystemToEventMutation,
  useChangeDistributionKeyMutation,
  useDeleteCardSystemFromEventMutation,
  useGetCardSystemForEventQuery,
  useGetCardSystemsForOrganizerQuery,
} from '@/hooks/api/uitpas';
import { Event } from '@/types/Event';
import { Alert, AlertVariants } from '@/ui/Alert';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { Select } from '@/ui/Select';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { parseOfferId } from '@/utils/parseOfferId';

import { OrganizerAddModal, OrganizerData } from '../../OrganizerAddModal';
import { TabContentProps } from './AdditionalInformationStep';
import { isUitpasOrganizer, OrganizerPicker } from './OrganizerPicker';

type Props = StackProps & TabContentProps;

const OrganizerStep = ({
  scope,
  offerId,
  onChangeCompleted,
  onSuccessfulChange,
  ...props
}: Props) => {
  const { t, i18n } = useTranslation();
  const { ...router } = useRouter();
  const queryClient = useQueryClient();

  const useGetOfferByIdQuery =
    scope === OfferTypes.EVENTS ? useGetEventByIdQuery : useGetPlaceByIdQuery;

  const getOfferByIdQuery = useGetOfferByIdQuery({ id: offerId });

  // @ts-expect-error
  const offer: Event | Place | undefined = getOfferByIdQuery.data;

  const organizer = offer?.organizer;
  const hasPriceInfo = (offer?.priceInfo ?? []).length > 0;
  const hasUitpasLabel = organizer ? isUitpasOrganizer(organizer) : false;

  // @ts-expect-error
  const getCardSystemForEventQuery = useGetCardSystemForEventQuery({
    scope,
    eventId: offerId,
    isUitpasOrganizer: hasUitpasLabel && hasPriceInfo,
  });

  // @ts-expect-error
  const getCardSystemsForOrganizerQuery = useGetCardSystemsForOrganizerQuery({
    scope,
    organizerId: organizer?.['@id']
      ? parseOfferId(organizer['@id'])
      : undefined,
    isUitpasOrganizer: hasUitpasLabel && hasPriceInfo,
  });

  // @ts-expect-error
  const cardSystemForEvent = getCardSystemForEventQuery.data ?? {};

  const selectedCardSystems: CardSystem[] = Object.values(cardSystemForEvent);

  // @ts-expect-error
  const cardSystems = getCardSystemsForOrganizerQuery.data ?? {};

  const [isOrganizerAddModalVisible, setIsOrganizerAddModalVisible] =
    useState(false);
  const [newOrganizerName, setNewOrganizerName] = useState('');

  useEffect(() => {
    if (!organizer) {
      onChangeCompleted(false);
      return;
    }
    onChangeCompleted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizer]);

  const createOrganizerMutation = useCreateOrganizerMutation();

  const addOfferOrganizerMutation = useAddOfferOrganizerMutation({
    onSuccess: onSuccessfulChange,
  });

  const deleteOfferOrganizerMutation = useDeleteOfferOrganizerMutation({
    onSuccess: onSuccessfulChange,
  });

  const addCardSystemToEventMutation = useAddCardSystemToEventMutation({
    onSuccess: (data) => {
      onSuccessfulChange(data);
      queryClient.invalidateQueries('uitpas_events');
    },
  });

  const deleteCardSystemFromEventMutation =
    useDeleteCardSystemFromEventMutation({
      onSuccess: (data) => {
        onSuccessfulChange(data);
        queryClient.invalidateQueries('uitpas_events');
      },
    });

  const handleAddCardSystemToEvent = (cardSystemId: number) => {
    addCardSystemToEventMutation.mutate({ cardSystemId, eventId: offerId });
  };

  const handleDeleteCardSystemFromEvent = (cardSystemId: number) => {
    deleteCardSystemFromEventMutation.mutate({
      cardSystemId,
      eventId: offerId,
    });
  };

  const handleToggleCardSystem = (
    offer: ChangeEvent<HTMLInputElement>,
    cardSystemId: number,
  ) => {
    if (offer.target.checked) {
      handleAddCardSystemToEvent(cardSystemId);
      return;
    }

    handleDeleteCardSystemFromEvent(cardSystemId);
  };

  const changeDistributionKey = useChangeDistributionKeyMutation({
    onSuccess: (data) => {
      onSuccessfulChange(data);
      queryClient.invalidateQueries('uitpas_events');
    },
  });

  const handleChangeDistributionKey = ({
    distributionKeyId,
    cardSystemId,
  }: {
    distributionKeyId: number;
    cardSystemId: number;
  }) => {
    changeDistributionKey.mutate({
      offerId,
      cardSystemId,
      distributionKeyId,
    });
  };

  const handleChangeOrganizer = (organizerId: string) => {
    addOfferOrganizerMutation.mutate({ id: offerId, organizerId, scope });
  };

  const handleAddOrganizer = async ({
    url,
    name,
    address,
    contact,
  }: OrganizerData) => {
    const payload = {
      mainLanguage: i18n.language,
      url,
      name: {
        [i18n.language]: name,
      },
      address: {
        [i18n.language]: {
          addressCountry: address.country,
          addressLocality: address.city.name,
          postalCode: address.city.zip,
          streetAddress: address.streetAndNumber,
        },
      },
      contact,
    };

    const { organizerId } = await createOrganizerMutation.mutateAsync(payload);

    await addOfferOrganizerMutation.mutateAsync({
      id: offerId,
      organizerId,
      scope,
    });

    setIsOrganizerAddModalVisible(false);
  };

  const hasUitpasCardSystems = Object.values(cardSystems).length > 0;

  const shouldShowCardSystems =
    hasUitpasLabel && hasUitpasCardSystems && hasPriceInfo;

  return (
    <Stack {...getStackProps(props)} spacing={5}>
      <Stack>
        <OrganizerAddModal
          prefillName={newOrganizerName}
          visible={isOrganizerAddModalVisible}
          onConfirm={handleAddOrganizer}
          onClose={() => setIsOrganizerAddModalVisible(false)}
        />
        <OrganizerPicker
          marginBottom={4}
          onChange={handleChangeOrganizer}
          onAddNewOrganizer={(newOrganizer) => {
            setNewOrganizerName(newOrganizer.label);
            setIsOrganizerAddModalVisible(true);
          }}
          onDeleteOrganizer={(organizerId) =>
            deleteOfferOrganizerMutation.mutate({
              id: offerId,
              organizerId,
              scope,
            })
          }
          organizer={organizer}
        />
        {hasUitpasLabel && (
          <Alert variant={AlertVariants.WARNING}>
            {hasPriceInfo ? (
              t('create.additionalInformation.organizer.uitpas_info')
            ) : (
              <Trans
                i18nKey="create.additionalInformation.organizer.uitpas_info_no_price_alert"
                components={{
                  link1: (
                    <Link
                      as="a"
                      css={`
                        text-decoration: underline;
                        font-weight: bold;
                      `}
                      href="#price_info"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push({ hash: 'price_info' }, undefined, {
                          shallow: true,
                        });
                      }}
                    />
                  ),
                }}
              />
            )}
          </Alert>
        )}
      </Stack>

      {shouldShowCardSystems && (
        <Stack spacing={3}>
          <Text fontWeight="bold">
            {t('create.additionalInformation.organizer.uitpas_cardsystems')}
          </Text>
          {Object.values(cardSystems).map((cardSystem: CardSystem) => (
            <Inline key={cardSystem.id} spacing={5}>
              <CheckboxWithLabel
                className="cardsystem-checkbox"
                id={cardSystem.id}
                name={cardSystem.name}
                checked={selectedCardSystems.some(
                  ({ id }) => cardSystem.id === id,
                )}
                disabled={false}
                onToggle={(e) => handleToggleCardSystem(e, cardSystem.id)}
              >
                {cardSystem.name}
              </CheckboxWithLabel>
              {Object.values(cardSystem.distributionKeys).length > 0 && (
                <Select
                  maxWidth="20%"
                  onChange={(e) =>
                    handleChangeDistributionKey({
                      distributionKeyId: parseInt(e.target.value),
                      cardSystemId: cardSystem.id,
                    })
                  }
                >
                  {Object.values(cardSystem.distributionKeys).map(
                    (distributionKey) => (
                      <option
                        selected={selectedCardSystems.some(
                          (selectedCardSystem) =>
                            Object.values(
                              selectedCardSystem.distributionKeys,
                            ).some(({ id }) => id === distributionKey.id),
                        )}
                        value={distributionKey.id}
                        key={distributionKey.id}
                      >
                        {distributionKey.name}
                      </option>
                    ),
                  )}
                </Select>
              )}
            </Inline>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export { OrganizerStep };
