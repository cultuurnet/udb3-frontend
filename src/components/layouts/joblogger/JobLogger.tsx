import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Box' or its corresponding... Remove this comment to see the full error message
import { Box } from '@/ui/Box';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Inline' or its correspond... Remove this comment to see the full error message
import { Inline } from '@/ui/Inline';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Stack' or its correspondi... Remove this comment to see the full error message
import { Stack } from '@/ui/Stack';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Title' or its correspondi... Remove this comment to see the full error message
import { Title } from '@/ui/Title';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Button' or its correspond... Remove this comment to see the full error message
import { Button, ButtonVariants } from '@/ui/Button';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Icon' or its correspondin... Remove this comment to see the full error message
import { Icon, Icons } from '@/ui/Icon';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/List' or its correspondin... Remove this comment to see the full error message
import { List } from '@/ui/List';

// @ts-expect-error ts-migrate(6142) FIXME: Module './Job' was resolved to '/Users/simondebrui... Remove this comment to see the full error message
import { Job, JobStates } from './Job';

import {
  useHandleWindowMessage,
  WindowMessageTypes,
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/useHandleWindowMessage... Remove this comment to see the full error message
} from '@/hooks/useHandleWindowMessage';

import {
  useHandleSocketMessage,
  // @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/useHandleSocketMessage... Remove this comment to see the full error message
  SocketMessageTypes,
} from '@/hooks/useHandleSocketMessage';

const JobLoggerStates = {
  IDLE: 'idle',
  WARNING: 'warning',
  BUSY: 'busy',
  COMPLETE: 'complete',
};

// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'children' implicitly has an 'any'... Remove this comment to see the full error message
const JobTitle = ({ children, className, ...props }) => (
  <Title
    css={`
      width: 100%;
      font-size: 1rem;
      text-transform: uppercase;
      border-bottom: black 1px solid;
    `}
    className={className}
    {...props}
  >
    {children}
  </Title>
);

JobTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'visible' implicitly has an 'any' ... Remove this comment to see the full error message
};

// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'onClose' implicitly has an 'any' ... Remove this comment to see the full error message
const JobLogger = ({ visible, onClose, onStatusChange }) => {
  const { t } = useTranslation();

  const [jobs, setJobs] = useState([]);
  const [hiddenJobIds, setHiddenJobIds] = useState([]);

  const activeJobs = useMemo(
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
    () => jobs.filter((job) => !hiddenJobIds.includes(job.id)),
    [jobs, hiddenJobIds],
  );

  const finishedJobs = useMemo(
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'state' does not exist on type 'never'.
    () => activeJobs.filter((job) => job.state === JobStates.FINISHED),
    [activeJobs],
  );
  const failedJobs = useMemo(
    () => activeJobs.filter((job) => job.state === JobStates.FAILED),
    [activeJobs],
  );
  const queuedJobs = useMemo(
    () => [
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'state' does not exist on type 'never'.
      ...activeJobs.filter((job) => job.state === JobStates.STARTED),
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'state' does not exist on type 'never'.
      ...activeJobs.filter((job) => job.state === JobStates.CREATED),
    ],
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'newJobState' implicitly has an 'any' ty... Remove this comment to see the full error message
    [activeJobs],
  );

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'jobId' implicitly has an 'any' ty... Remove this comment to see the full error message
  const updateJobState = (newJobState) => ({ job_id: jobId, location }) =>
    setJobs((previousJobs) =>
      previousJobs.map((job) => {
        const { id, finishedAt, exportUrl, state } = job;
        if (id !== jobId) return job;

        if (state === JobStates.FAILED) {
          // Jobs can't transition from a failed status to another status.
          return job;
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        }

        return {
          ...job,
          state: newJobState,
          finishedAt: [JobStates.FINISHED, JobStates.FAILED].includes(
            newJobState,
          )
            ? new Date()
            : finishedAt,
          // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'job' implicitly has an 'any' type... Remove this comment to see the full error message
          exportUrl: location || exportUrl,
        };
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(previousJobs: never[]) => any[]... Remove this comment to see the full error message
      }),
    );

  const addJob = ({ job }) =>
    setJobs((previousJobs) => [
      {
        ...job,
        state: JobStates.CREATED,
        exportUrl: '',
        createdAt: new Date(),
      },
      ...previousJobs,
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'id' implicitly has an 'any' type.
    ]);

  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(prevHiddenJobIds: never[]) => a... Remove this comment to see the full error message
  const handleClickHideJob = (id) =>
    setHiddenJobIds((prevHiddenJobIds) => {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
      if (prevHiddenJobIds.includes(id)) return prevHiddenJobIds;
      return [...prevHiddenJobIds, id];
    });

  useHandleSocketMessage({
    [SocketMessageTypes.JOB_STARTED]: updateJobState(JobStates.STARTED),
    [SocketMessageTypes.JOB_INFO]: updateJobState(JobStates.STARTED),
    [SocketMessageTypes.JOB_FINISHED]: updateJobState(JobStates.FINISHED),
    [SocketMessageTypes.JOB_FAILED]: updateJobState(JobStates.FAILED),
  });

  useHandleWindowMessage({
    [WindowMessageTypes.JOB_ADDED]: addJob,
  });

  useEffect(() => {
    if (failedJobs.length > 0) {
      onStatusChange(JobLoggerStates.WARNING);
      return;
    }
    if (finishedJobs.length > 0) {
      onStatusChange(JobLoggerStates.COMPLETE);
      return;
    }
    if (queuedJobs.length > 0) {
      onStatusChange(JobLoggerStates.BUSY);
      return;
    }
    onStatusChange(JobLoggerStates.IDLE);
  }, [failedJobs, finishedJobs, queuedJobs]);

  const jobLoggerMenus = [
    {
      title: t('jobs.finished'),
      items: finishedJobs,
    },
    {
      title: t('jobs.notifications'),
      items: failedJobs,
    },
    {
      title: t('jobs.in_progress'),
      items: queuedJobs,
    },
  ];

  return (
    <Inline
      css={`
        ${visible && 'display: none;'}
      `}
      position="absolute"
      height="100%"
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      width={{ default: 'calc(100% - 230px)', s: 'calc(100% - 65px)' }}
      left={{ default: 230, s: 65 }}
      zIndex={1998}
    >
      <Stack padding={3} width={320} backgroundColor="white">
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Inline as="div" justifyContent="flex-end">
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Button variant={ButtonVariants.UNSTYLED} onClick={onClose}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Icon name={Icons.TIMES} opacity={{ default: 0.5, hover: 1 }} />
          </Button>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        </Inline>
        <Stack spacing={4}>
          {jobLoggerMenus.map((jobLoggerMenu) => (
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <Stack key={jobLoggerMenu.title}>
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <JobTitle>{jobLoggerMenu.title}</JobTitle>
              <List>
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                {jobLoggerMenu.items.map((job) => (
                  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <Job
                    key={job.id}
                    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    createdAt={job.createdAt}
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'createdAt' does not exist on type 'never... Remove this comment to see the full error message
                    finishedAt={job.finishedAt}
                    state={job.state}
                    messages={job.messages}
                    exportUrl={job.exportUrl}
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type 'never'.
                    onClick={() => handleClickHideJob(job.id)}
                  />
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                ))}
              </List>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Box flex={1} opacity={0.5} backgroundColor="black" onClick={onClose} />
    </Inline>
  );
};

JobLogger.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  onStatusChange: PropTypes.func,
};

export { JobLogger, JobStates, JobLoggerStates };
