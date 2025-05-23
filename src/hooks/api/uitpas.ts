import { OfferTypes } from '@/constants/OfferType';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
  ExtendQueryOptions,
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';

type CardSystem = {
  id: number;
  name: string;
  distributionKeys?: any[];
};

const getCardSystemForEvent = async ({ headers, eventId }) => {
  const res = await fetchFromApi({
    path: `/uitpas/events/${eventId.toString()}/cardSystems/`,
    options: {
      headers,
    },
  });
  if (res.status === 404) {
    return [] as CardSystem[];
  }
  return (await res.json()) as CardSystem[];
};

const useGetCardSystemForEventQuery = (
  { scope, eventId, isUitpasOrganizer },
  configuration: ExtendQueryOptions<typeof getCardSystemForEvent> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['uitpas_events'],
    queryFn: getCardSystemForEvent,
    queryArguments: { eventId },
    enabled: scope === OfferTypes.EVENTS && !!eventId && isUitpasOrganizer,
    retry: false,
    ...configuration,
  });

const getCardSystemsForOrganizer = async ({ headers, organizerId }) => {
  const res = await fetchFromApi({
    path: `/uitpas/organizers/${organizerId.toString()}/cardSystems/`,
    options: {
      headers,
    },
  });
  return (await res.json()) as CardSystem[];
};

const useGetCardSystemsForOrganizerQuery = (
  { scope, organizerId, isUitpasOrganizer },
  configuration: ExtendQueryOptions<typeof getCardSystemsForOrganizer> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['uitpas_organizers'],
    queryFn: getCardSystemsForOrganizer,
    queryArguments: { organizerId },
    enabled: scope === OfferTypes.EVENTS && !!organizerId && isUitpasOrganizer,
    retry: 2,
    ...configuration,
  });

const addCardSystemToEvent = async ({ headers, eventId, cardSystemId }) =>
  await fetchFromApi({
    path: `/uitpas/events/${eventId.toString()}/cardSystems/${cardSystemId}`,
    options: {
      headers,
      method: 'PUT',
    },
  });

const useAddCardSystemToEventMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addCardSystemToEvent,
    mutationKey: 'uitpas-add-cardsystem-to-event',
    ...configuration,
  });

const deleteCardSystemFromEvent = async ({ headers, eventId, cardSystemId }) =>
  await fetchFromApi({
    path: `/uitpas/events/${eventId.toString()}/cardSystems/${cardSystemId}`,
    options: {
      headers,
      method: 'DELETE',
    },
  });

const useDeleteCardSystemFromEventMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteCardSystemFromEvent,
    mutationKey: 'uitpas-delete-cardsystem-from-event',
    ...configuration,
  });

const changeDistributionKey = async ({
  headers,
  eventId,
  cardSystemId,
  distributionKeyId,
}) =>
  await fetchFromApi({
    path: `/uitpas/events/${eventId.toString()}/cardSystems/${cardSystemId}/distributionKey/${distributionKeyId}`,
    options: {
      headers,
      method: 'PUT',
    },
  });

const useChangeDistributionKeyMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeDistributionKey,
    mutationKey: 'uitpas-change-distribution-key',
    ...configuration,
  });

export {
  changeDistributionKey,
  useAddCardSystemToEventMutation,
  useChangeDistributionKeyMutation,
  useDeleteCardSystemFromEventMutation,
  useGetCardSystemForEventQuery,
  useGetCardSystemsForOrganizerQuery,
};
export type { CardSystem };
