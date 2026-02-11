import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { OfferTypes } from '@/constants/OfferType';
import { PermissionTypes } from '@/constants/PermissionTypes';
import { useDuplicateEventMutation } from '@/hooks/api/events';
import { useAddOfferLabelMutation } from '@/hooks/api/offers';
import { useConsoleDebugger } from '@/hooks/useConsoleDebugger';
import {
  FILMINVOER_LABEL,
  hasMovieLabel,
  isDeletable,
  isEditable,
  isExpired,
  Offer,
} from '@/types/Offer';
import { Values } from '@/types/Values';
import { Badge, BadgeVariants } from '@/ui/Badge';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Link, LinkVariants } from '@/ui/Link';
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
  const duplicateEventMutation = useDuplicateEventMutation();
  const addLabelMutation = useAddOfferLabelMutation();
  const { error: logError } = useConsoleDebugger();

  const handleDuplicateAsMovie = async () => {
    try {
      const result = await duplicateEventMutation.mutateAsync({
        eventId: offerId,
        calendarType: offer.calendarType,
        subEvent: offer.subEvent || [],
      });

      await addLabelMutation.mutateAsync({
        id: result.eventId,
        label: FILMINVOER_LABEL,
        scope: OfferTypes.EVENTS,
      });

      router.push(`/manage/movies/${result.eventId}/edit`);
    } catch (error) {
      logError('Failed to duplicate as movie:', error);
    }
  };

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

  const shouldShowLanguageBadge = offer.mainLanguage !== i18n.language;

  const getLanguageBadge = () => {
    if (!shouldShowLanguageBadge) return undefined;

    return (
      <Badge variant={BadgeVariants.SECONDARY}>{offer.mainLanguage}</Badge>
    );
  };

  type Action = {
    iconName: Values<typeof Icons>;
    title: string;
    disabled: boolean;
    suffix?: ReactNode;
  } & (
    | { onClick: () => void; href?: never }
    | { href: string; onClick?: never }
  );

  const actions: Action[] = [];

  if (canEdit) {
    actions.push({
      iconName: Icons.PENCIL,
      title: t('preview.actions.edit'),
      href: `/events/${offerId}/edit`,
      disabled: !isEditable(offer),
      suffix: getLanguageBadge(),
    });
  }

  if (canModerate && canEditMovies) {
    actions.push({
      iconName: Icons.VIDEO,
      title: t('preview.actions.edit_as_movie'),
      href: `/manage/movies/${offerId}/edit`,
      disabled: !isEditable(offer),
      suffix: getLanguageBadge(),
    });
  }

  if (canModerate) {
    actions.push({
      iconName: Icons.GLOBE,
      title: t('preview.actions.translate'),
      href: `/events/${offerId}/translate`,
      disabled: !isEditable(offer),
    });
  }

  if (canDuplicate) {
    actions.push({
      iconName: Icons.COPY,
      title: t('preview.actions.duplicate'),
      href: `/events/${offerId}/duplicate`,
      disabled: !isEditable(offer),
    });
  }

  if (canDuplicate && canEditMovies) {
    actions.push({
      iconName: Icons.VIDEO,
      title: t('preview.actions.duplicate_as_movie'),
      onClick: handleDuplicateAsMovie,
      disabled: !isEditable(offer),
    });
  }

  if (canModerate) {
    actions.push({
      iconName: Icons.CALENDAR_CHECK,
      title: t('preview.actions.change_availability'),
      href: `/events/${offerId}/availability`,
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
      {actions.map(({ iconName, title, onClick, href, disabled, suffix }) => {
        if (onClick) {
          return (
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
          );
        }

        if (href && disabled) {
          return (
            <Button
              key={title}
              variant={ButtonVariants.SECONDARY}
              disabled={disabled}
              iconName={iconName}
              spacing={3}
              suffix={suffix}
            >
              {title}
            </Button>
          );
        }

        if (href) {
          return (
            <Link
              key={title}
              variant={LinkVariants.BUTTON_SECONDARY}
              href={href}
              iconName={iconName}
              spacing={3}
              suffix={suffix}
              width="100%"
            >
              {title}
            </Link>
          );
        }

        return null;
      })}
      {/* Moderation component can be added here */}
    </Stack>
  );
};

export { OfferPreviewSidebar };
