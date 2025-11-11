import { useState, useCallback, useRef } from 'react';

/**
 * useGoalCache - Client-side caching for goals
 * Caches goal data in memory with timestamp validation
 * Reduces Firestore reads and improves performance
 *
 * Usage:
 * const { getCachedGoal, invalidateCache, cache } = useGoalCache();
 * const goal = await getCachedGoal(level, identifier, fetchFunction);
 */
export const useGoalCache = (cacheDurationMs = 5 * 60 * 1000) => {
  const [cache, setCache] = useState({});
  const cacheTimestampsRef = useRef({});

  const isCacheValid = useCallback((key) => {
    const timestamp = cacheTimestampsRef.current[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < cacheDurationMs;
  }, [cacheDurationMs]);

  const getCachedGoal = useCallback(
    async (level, identifier, fetchFunction) => {
      const key = `${level}-${identifier}`;

      // Check if cached data is still valid
      if (isCacheValid(key) && cache[key]) {
        console.log(`[Cache Hit] ${key}`);
        return cache[key];
      }

      // Fetch from source (Firebase)
      console.log(`[Cache Miss] ${key} - Fetching from source`);
      try {
        const data = await fetchFunction(level, identifier);

        // Update cache
        setCache((prev) => ({ ...prev, [key]: data }));
        cacheTimestampsRef.current[key] = Date.now();

        return data;
      } catch (error) {
        console.error(`Error fetching goal ${key}:`, error);
        throw error;
      }
    },
    [cache, isCacheValid]
  );

  const invalidateCache = useCallback((key) => {
    console.log(`[Cache Invalidate] ${key}`);
    setCache((prev) => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
    delete cacheTimestampsRef.current[key];
  }, []);

  const invalidateAllCache = useCallback(() => {
    console.log('[Cache Invalidate All]');
    setCache({});
    cacheTimestampsRef.current = {};
  }, []);

  const setCacheDuration = useCallback((ms) => {
    // Duration is set at initialization, no dynamic change needed
    // But this is here for future extensibility
  }, []);

  return {
    getCachedGoal,
    invalidateCache,
    invalidateAllCache,
    cache,
  };
};
