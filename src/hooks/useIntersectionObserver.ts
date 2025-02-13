import { RefObject, useEffect, useMemo, useState } from 'react';

type IntersectionObserverOptions = IntersectionObserverInit & {
  freezeOnceVisible?: boolean;
};

const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: IntersectionObserverOptions,
) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  const memoizedThreshold = useMemo(
    () => (Array.isArray(threshold) ? [...threshold] : threshold),
    [threshold],
  );

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observer = new IntersectionObserver(updateEntry, {
      threshold: memoizedThreshold,
      root,
      rootMargin,
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, memoizedThreshold, root, rootMargin, frozen]);

  return entry;
};

export { useIntersectionObserver };
