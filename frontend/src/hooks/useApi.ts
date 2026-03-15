import { useState, useCallback, useEffect } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  endpoint: string,
  dependencies: unknown[] = [],
  immediate = true
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await apiClient.get<T>(endpoint);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load data';
      setState({ data: null, loading: false, error: message });
    }
  }, [endpoint]);

  useEffect(() => {
    if (immediate) {
      void fetch();
    }
  }, [endpoint, immediate, fetch, ...dependencies]);

  const refetch = useCallback(() => fetch(), [fetch]);

  return { ...state, refetch };
}

export function useApiMutation<TInput, TOutput>(
  method: 'post' | 'put' | 'delete' = 'post'
) {
  const [state, setState] = useState<UseApiState<TOutput>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (endpoint: string, input?: TInput): Promise<TOutput | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        let data: TOutput;
        if (method === 'post') {
          data = await apiClient.post<TOutput>(endpoint, input);
        } else if (method === 'put') {
          data = await apiClient.put<TOutput>(endpoint, input);
        } else {
          data = await apiClient.delete<TOutput>(endpoint);
        }
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Operation failed';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [method]
  );

  return { ...state, mutate };
}
