import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { Offer } from '@/types/Offer';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icons } from '@/ui/Icon';
import { Stack } from '@/ui/Stack';
import { parseOfferId } from '@/utils/parseOfferId';

type Props = {
  offer: Offer;
  onDelete: (offer: Offer) => void;
};

const OfferPreviewSidebar = ({ offer, onDelete }: Props) => {
  const { t } = useTranslation();
  const offerId = parseOfferId(offer['@id']);
  const router = useRouter();

  const actions = [
    {
      iconName: Icons.PENCIL,
      title: t('preview.actions.edit'),
      onClick: () => router.push(`/events/${offerId}/edit`),
      disabled: false,
    },
    {
      iconName: Icons.GLOBE,
      title: t('preview.actions.translate'),
      onClick: () => router.push(`/events/${offerId}/translate`),
      disabled: false,
    },
    {
      iconName: Icons.COPY,
      title: t('preview.actions.duplicate'),
      onClick: () => router.push(`/events/${offerId}/duplicate`),
      disabled: false,
    },
    {
      iconName: Icons.CALENDAR_CHECK,
      title: t('preview.actions.change_availability'),
      onClick: () => router.push(`/events/${offerId}/availability`),
      disabled: false,
    },
    {
      iconName: Icons.TRASH,
      title: t('preview.actions.delete'),
      onClick: () => onDelete(offer),
      disabled: false,
    },
  ];

  return (
    <Stack spacing={3.5} paddingX={4}>
      {actions.map(({ iconName, title, onClick, disabled }) => (
        <Button
          key={title}
          variant={ButtonVariants.SECONDARY}
          onClick={onClick}
          disabled={disabled}
          iconName={iconName}
          spacing={3}
        >
          {title}
        </Button>
      ))}
    </Stack>
  );
};

export { OfferPreviewSidebar };
