import { dehydrate, UseQueryResult } from '@tanstack/react-query';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  GetOrganizerPermissionsResponse,
  prefetchGetOrganizerByIdQuery,
  prefetchGetOrganizerPermissionsQuery,
  prefetchGetVerenigingsloketByOrganizerIdQuery,
  useGetOrganizerByIdQuery,
  useGetOrganizerPermissionsQuery,
  useGetVerenigingsloketByOrganizerIdQuery,
} from '@/hooks/api/organizers';
import {
  OwnershipRequest,
  OwnershipState,
  useGetOwnershipRequestsQuery,
} from '@/hooks/api/ownerships';
import { useGetUserQuery, User } from '@/hooks/api/user';
import { SupportedLanguage } from '@/i18n/index';
import { RequestOwnershipModal } from '@/pages/organizers/[organizerId]/preview/RequestOwnershipModal';
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Link, LinkButtonVariants } from '@/ui/Link';
import { Page } from '@/ui/Page';
import { Stack } from '@/ui/Stack';
import { FetchError } from '@/utils/fetchFromApi';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

import { OrganizerTable } from './OrganizerTable';

const OrganizersPreview = () => {
  const { t, i18n } = useTranslation();
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const isOwnershipEnabled = publicRuntimeConfig.ownershipEnabled === 'true';
  const organizerId = router.query.organizerId as string;

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery({
    id: organizerId,
  }) as UseQueryResult<Organizer, FetchError>;

  const getOrganizerPermissionsQuery = useGetOrganizerPermissionsQuery({
    organizerId: organizerId,
  }) as UseQueryResult<GetOrganizerPermissionsResponse, FetchError>;

  const getVereningingsloketQuery = useGetVerenigingsloketByOrganizerIdQuery({
    id: organizerId,
  });

  const verenigingsloket = getVereningingsloketQuery?.data;

  const organizerPermissions =
    getOrganizerPermissionsQuery?.data?.permissions ?? [];
  const canEdit = organizerPermissions.includes('Organisaties bewerken');

  const organizer: Organizer = getOrganizerByIdQuery?.data;

  const organizerName: string = getLanguageObjectOrFallback(
    organizer?.name,
    i18n.language as SupportedLanguage,
    organizer?.mainLanguage as SupportedLanguage,
  );

  const getUserQuery = useGetUserQuery() as UseQueryResult<User, FetchError>;

  const userId = getUserQuery.data?.sub;

  const getOwnershipRequestsQuery = useGetOwnershipRequestsQuery({
    itemId: organizerId,
    ownerId: userId,
  });

  const userRequests = getOwnershipRequestsQuery?.data?.member;
  const isOwnershipRequested = userRequests?.some(
    (request: OwnershipRequest) => request.state === OwnershipState.REQUESTED,
  );

  return (
    <Page>
      <Page.Title>{organizerName}</Page.Title>
      <Page.Content>
        <Stack>
          <Stack flex={1}>
            {isOwnershipEnabled && (
              <>
                <RequestOwnershipModal
                  organizer={organizer}
                  isVisible={isQuestionModalVisible}
                  onClose={() => setIsQuestionModalVisible(false)}
                  onSuccess={() => setIsSuccessAlertVisible(true)}
                />
                {isOwnershipRequested && !isSuccessAlertVisible && (
                  <Alert
                    variant={AlertVariants.PRIMARY}
                    marginBottom={4}
                    fullWidth
                  >
                    {t('organizers.ownerships.request.pending', {
                      organizerName,
                    })}
                  </Alert>
                )}
              </>
            )}
            <Inline spacing={5}>
              <Stack flex={3}>
                <OrganizerTable
                  organizer={organizer}
                  vcode={verenigingsloket?.vcode}
                  isOwner={canEdit}
                />
              </Stack>
              <Stack spacing={3.5} flex={1}>
                {!canEdit && isOwnershipEnabled && !isOwnershipRequested && (
                  <Button
                    variant={ButtonVariants.PRIMARY}
                    spacing={3}
                    iconName={Icons.PLUS_CIRCLE}
                    onClick={() => setIsQuestionModalVisible(true)}
                  >
                    {t('organizers.detail.actions.request')}
                  </Button>
                )}
                {canEdit && (
                  <Link
                    variant={LinkButtonVariants.BUTTON_SECONDARY}
                    spacing={3}
                    iconName={Icons.PENCIL}
                    href={`/organizer/${organizerId}/edit`}
                    width="100%"
                  >
                    {t('organizers.detail.actions.edit')}
                  </Link>
                )}
                {canEdit && isOwnershipEnabled && !isOwnershipRequested && (
                  <Link
                    variant={LinkButtonVariants.BUTTON_SECONDARY}
                    spacing={3}
                    iconName={Icons.USERS}
                    href={`/organizer/${organizerId}/ownerships`}
                    width="100%"
                  >
                    {t('organizers.detail.actions.manage')}
                  </Link>
                )}
                <Stack spacing={3.5}>
                  <Link
                    variant={LinkButtonVariants.BUTTON_SECONDARY}
                    href={`/search?query=organizer.id:${encodeURIComponent(
                      organizerId,
                    )} AND _type:event`}
                    iconName={Icons.CALENDAR_ALT}
                    width="100%"
                  >
                    {t('organizers.detail.actions.events')}
                  </Link>
                  <Link
                    variant={LinkButtonVariants.BUTTON_SECONDARY}
                    href={`/search?query=organizer.id:${encodeURIComponent(
                      organizerId,
                    )} AND _type:place`}
                    iconName={Icons.BUILDING}
                    width="100%"
                  >
                    {t('organizers.detail.actions.places')}
                  </Link>
                </Stack>
              </Stack>
            </Inline>
          </Stack>
        </Stack>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    try {
      await Promise.all([
        prefetchGetOrganizerByIdQuery({
          req,
          queryClient,
          id: query.organizerId,
        }),
        prefetchGetOrganizerPermissionsQuery({
          req,
          queryClient,
          organizerId: query.organizerId,
        }),
        prefetchGetVerenigingsloketByOrganizerIdQuery({
          req,
          queryClient,
          id: query.organizerId,
        }),
      ]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default OrganizersPreview;
