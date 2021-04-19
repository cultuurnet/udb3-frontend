import { useEffect, useRef } from 'react';
import { detailedDiff } from 'deep-object-diff';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import pick from 'lodash/pick';

const diff = (oldValue, newValue) => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'added' does not exist on type '{}'.
  const { added = {}, deleted = {}, updated = {} } = detailedDiff(
    oldValue,
    newValue,
  );
  return pick(newValue, Object.keys({ ...deleted, ...added, ...updated }));
};

const useLog = (
  variables,
  { rawData = false, showOnlyDifference = false } = {},
) => {
  const ref = useRef();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const toLog = showOnlyDifference ? diff(ref.current, variables) : variables;
    ref.current = variables;

    // eslint-disable-next-line no-console
    console.log(rawData ? toLog : JSON.stringify(toLog, undefined, 2));
  }, Object.values(variables));
};

export { useLog };
