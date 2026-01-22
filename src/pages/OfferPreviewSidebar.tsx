import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PermissionTypes } from '@/constants/PermissionTypes';
import {
  hasMovieLabel,
  isDeletable,
  isEditable,
  isExpired,
  Offer,
} from '@/types/Offer';
import { Badge, BadgeVariants } from '@/ui/Badge';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Stack } from '@/ui/Stack';
import { formatPermission } from '@/utils/formatPermission';
import { parseOfferId } from '@/utils/parseOfferId';

type Props = {
  offer: Offer;
  onDelete: (offer: Offer) => void;
  userPermissions: string[];
  eventPermissions: string[];
};

const OfferPreviewSidebar = ({
  offer,
  onDelete,
  userPermissions,
  eventPermissions,
}: Props) => {
  const { t, i18n } = useTranslation();
  const offerId = parseOfferId(offer['@id']);
  const router = useRouter();

  const isGodUser = userPermissions?.includes(
    PermissionTypes.GEBRUIKERS_BEHEREN,
  );

  const hasEditMoviesPermission = userPermissions?.includes(
    PermissionTypes.FILMS_AANMAKEN,
  );

  const hasPermissions = eventPermissions?.length > 0;

  const canEditMovies = hasEditMoviesPermission && hasMovieLabel(offer);

  const canEdit =
    eventPermissions?.includes(
      formatPermission(PermissionTypes.AANBOD_BEWERKEN),
    ) &&
    (!isExpired(offer) || isGodUser);

  const canModerate =
    eventPermissions?.includes(
      formatPermission(PermissionTypes.AANBOD_MODEREREN),
    ) &&
    (!isExpired(offer) || isGodUser);

  const canDelete =
    eventPermissions?.includes(
      formatPermission(PermissionTypes.AANBOD_VERWIJDEREN),
    ) &&
    (!isExpired(offer) || isGodUser);

  const canDuplicate = hasPermissions;

  // Check if the offer's main language differs from the current UI language
  const shouldShowLanguageBadge = offer.mainLanguage !== i18n.language;

  // Helper function to create language badge if needed
  const getLanguageBadge = () => {
    if (!shouldShowLanguageBadge) return undefined;

    return (
      <Badge variant={BadgeVariants.SECONDARY}>
        {offer.mainLanguage}
      </Badge>
    );
  };

  const actions: Array<{
    iconName: Icons;
    title: string;
    onClick: () => void;
    disabled: boolean;
    suffix?: ReactNode;
  }> = [];

  if (canEdit) {
    actions.push({
      iconName: Icons.PENCIL,
      title: t('preview.actions.edit'),
      onClick: () => router.push(`/events/${offerId}/edit`),
      disabled: !isEditable(offer),
      suffix: getLanguageBadge(),
    });
  }

  if (canModerate && canEditMovies) {
    actions.push({
      iconName: Icons.VIDEO,
      title: t('preview.actions.edit_as_movie'),
      onClick: () => router.push(`/events/${offerId}/edit-movie`),
      disabled: !isEditable(offer),
      suffix: getLanguageBadge(),
    });
  }

  if (canModerate) {
    actions.push({
      iconName: Icons.GLOBE,
      title: t('preview.actions.translate'),
      onClick: () => router.push(`/events/${offerId}/translate`),
      disabled: !isEditable(offer),
    });
  }

  if (canDuplicate) {
    actions.push({
      iconName: Icons.COPY,
      title: t('preview.actions.duplicate'),
      onClick: () => router.push(`/events/${offerId}/duplicate`),
      disabled: !isEditable(offer),
    });
  }

  if (canDuplicate && canEditMovies) {
    actions.push({
      iconName: Icons.VIDEO,
      title: t('preview.actions.duplicate_as_movie'),
      onClick: () => router.push(`/events/${offerId}/duplicate-movie`),
      disabled: !isEditable(offer),
    });
  }

  if (canModerate) {
    actions.push({
      iconName: Icons.CALENDAR_CHECK,
      title: t('preview.actions.change_availability'),
      onClick: () => router.push(`/events/${offerId}/availability`),
      disabled: !isEditable(offer),
    });
  }

  if (canDelete) {
    actions.push({
      iconName: Icons.TRASH,
      title: t('preview.actions.delete'),
      onClick: () => onDelete(offer),
      disabled: !isDeletable(offer),
    });
  }

  return (
    <Stack spacing={3.5} paddingX={4}>
      {actions.map(({ iconName, title, onClick, disabled, suffix }) => (
        <Button
          key={title}
          variant={ButtonVariants.SECONDARY}
          onClick={onClick}
          disabled={disabled}
          iconName={iconName}
          spacing={3}
          suffix={suffix}
        >
          {title}
        </Button>
      ))}
      {/* Moderation component can be added here */}
    </Stack>
  );
};

export { OfferPreviewSidebar };
