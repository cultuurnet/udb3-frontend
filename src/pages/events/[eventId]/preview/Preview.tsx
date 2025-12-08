import { useRouter } from 'next/router';

import { OfferTypes } from '@/constants/OfferType';
import { useGetOfferByIdQuery } from '@/hooks/api/offers';
import { Page } from '@/ui/Page';

const Preview = () => {
  const router = useRouter();
  const { eventId } = router.query;

  const getOfferByIdQuery = useGetOfferByIdQuery({
    id: eventId as string,
    scope: OfferTypes.EVENTS,
  });

  const title = getOfferByIdQuery.data?.name.nl;

  return (
    <Page>
      <Page.Title>{title}</Page.Title>
    </Page>
  );
};

export { Preview };
