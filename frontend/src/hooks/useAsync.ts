import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for safely managing async operations in useEffect
 * Prevents state updates after component unmount
 * 
 * @returns Object with isMounted tracking and cleanup function
 * 
 * @example
 * const { isMounted, cleanup } = useAsync();
 * 
 * useEffect(() => {
 *   const fetchData = async () => {
 *     if (!isMounted()) return;
 *     const data = await api.get('/data');
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   };
 *   
 *   fetchData();
 *   return cleanup;
 * }, []);
 */
export function useAsync() {
  const isMountedRef = useRef(true);

  const isMounted = useCallback(() => isMountedRef.current, []);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { isMounted, cleanup };
}
