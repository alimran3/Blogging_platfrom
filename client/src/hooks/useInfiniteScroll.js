import { useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

export const useInfiniteScroll = (fetchNextPage, hasNextPage, isFetchingNextPage) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ref };
};