import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

// In-memory query cache store
// Format: key -> { data, timestamp, userId, error }
const cacheStore = new Map();
const inFlightRequests = new Map();
const subscribers = new Map();

function getFullKey(key, userId) {
  return `${userId || 'anonymous'}:${Array.isArray(key) ? key.join(':') : key}`;
}

export function invalidateQueries(keyPattern) {
  const keysToDelete = [];
  cacheStore.forEach((value, key) => {
    if (typeof keyPattern === 'string' && key.includes(keyPattern)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((k) => cacheStore.delete(k));
  notifySubscribers();
}

export function clearQueryCache() {
  cacheStore.clear();
  inFlightRequests.clear();
  notifySubscribers();
}

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

/**
 * useQuery custom hook implementing stale-while-revalidate for RepoSense
 */
export function useQuery(key, fetcher, options = {}) {
  const { user } = useStore();
  const userId = user?.id || user?._id || 'anon';
  const fullKey = getFullKey(key, userId);

  const staleTime = options.staleTime ?? 60000; // 60s default
  const gcTime = options.gcTime ?? 600000;     // 10m default
  const enabled = options.enabled ?? true;

  const [state, setState] = useState(() => {
    const cached = cacheStore.get(fullKey);
    if (cached) {
      const isStale = Date.now() - cached.timestamp > staleTime;
      return {
        data: cached.data,
        isLoading: false,
        isFetching: isStale,
        error: cached.error || null,
      };
    }
    return {
      data: options.placeholderData || null,
      isLoading: enabled,
      isFetching: enabled,
      error: null,
    };
  });

  const isMountedRef = useRef(true);

  const executeFetch = useCallback(async (isBackground = false) => {
    if (!enabled || !fetcher) return;

    if (!isBackground) {
      setState((prev) => ({ ...prev, isFetching: true }));
    }

    let promise = inFlightRequests.get(fullKey);
    if (!promise) {
      promise = (async () => {
        try {
          const res = await fetcher();
          cacheStore.set(fullKey, {
            data: res,
            timestamp: Date.now(),
            userId,
            error: null,
          });
          return res;
        } catch (err) {
          const prevCached = cacheStore.get(fullKey);
          if (prevCached) {
            cacheStore.set(fullKey, { ...prevCached, error: err });
          }
          throw err;
        } finally {
          inFlightRequests.delete(fullKey);
        }
      })();
      inFlightRequests.set(fullKey, promise);
    }

    try {
      const data = await promise;
      if (isMountedRef.current) {
        setState({
          data,
          isLoading: false,
          isFetching: false,
          error: null,
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isFetching: false,
          error: err,
        }));
      }
    }
  }, [enabled, fetcher, fullKey, userId]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!enabled) return;

    const cached = cacheStore.get(fullKey);
    if (!cached) {
      executeFetch(false);
    } else {
      const isStale = Date.now() - cached.timestamp > staleTime;
      if (isStale) {
        executeFetch(true);
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fullKey, enabled, staleTime, executeFetch]);

  const refetch = useCallback(() => executeFetch(false), [executeFetch]);

  return {
    ...state,
    refetch,
  };
}
