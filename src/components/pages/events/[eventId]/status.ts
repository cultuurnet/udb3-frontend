import { useRouter } from 'next/router';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/getApplicationServerSi... Remove this comment to see the full error message
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/events' or its cor... Remove this comment to see the full error message
import { useChangeStatus, useGetEventById } from '@/hooks/api/events';
import { dehydrate } from 'react-query/hydration';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Spinner' or its correspon... Remove this comment to see the full error message
import { Spinner } from '@/ui/Spinner';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/authenticated-quer... Remove this comment to see the full error message
import { QueryStatus } from '@/hooks/api/authenticated-query';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/components/StatusPageSingle'... Remove this comment to see the full error message
import { StatusPageSingle } from '@/components/StatusPageSingle';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/CalendarType' or i... Remove this comment to see the full error message
import { CalendarType } from '@/constants/CalendarType';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/components/StatusPageMultipl... Remove this comment to see the full error message
import { StatusPageMultiple } from '@/components/StatusPageMultiple';

const Status = () => {
  const router = useRouter();
  const { eventId } = router.query;

  const getEventByIdQuery = useGetEventById({ id: eventId });

  const event = getEventByIdQuery.data;

  if (getEventByIdQuery.status === QueryStatus.LOADING) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'marginTop'.
    return <Spinner marginTop={4} />;
  }

  if (event.calendarType === CalendarType.MULTIPLE)
    return (
      <StatusPageMultiple
        event={event}
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'refetchEvent'.
        refetchEvent={getEventByIdQuery.refetch}
      />
    );

  return (
    <StatusPageSingle
      offer={event}
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'error'. Did you mean 'Error'?
      error={getEventByIdQuery.error}
      // @ts-expect-error ts-migrate(2539) FIXME: Cannot assign to 'useChangeStatus' because it is n... Remove this comment to see the full error message
      useChangeStatus={useChangeStatus}
    />
  );
};

export const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies, queryClient }) => {
    const { eventId } = query;
    await useGetEventById({ req, queryClient, id: eventId });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies,
      },
    };
  },
);

export default Status;
