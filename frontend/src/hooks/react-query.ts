/**
 * Example React Query hooks for response caching and request deduplication
 * 
 * ⚠️ OPTIONAL: These hooks require @tanstack/react-query to be installed:
 * npm install @tanstack/react-query
 * 
 * If not installed yet, use the simpler useApi hook instead.
 * When ready to add React Query, uncomment the imports below and follow setup instructions.
 */

/*
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============ HEALTH METRICS HOOKS ============

export function useHealthMetrics() {
  return useQuery({
    queryKey: ['health-metrics'],
    queryFn: () => apiClient.get('/api/protected/health-metrics'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useHealthMetricsByType(metricType: string) {
  return useQuery({
    queryKey: ['health-metrics', metricType],
    queryFn: () => apiClient.get(`/api/protected/health-metrics?type=${metricType}`),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateHealthMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiClient.post('/api/protected/health-metrics', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
    },
  });
}

// ============ WELLNESS LOGS HOOKS ============

export function useWellnessLogs() {
  return useQuery({
    queryKey: ['wellness-logs'],
    queryFn: () => apiClient.get('/api/protected/wellness-logs'),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useWellnessLogsByType(logType: string) {
  return useQuery({
    queryKey: ['wellness-logs', logType],
    queryFn: () => apiClient.get(`/api/protected/wellness-logs?type=${logType}`),
    staleTime: 3 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateWellnessLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiClient.post('/api/protected/wellness-logs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-logs'] });
    },
  });
}

// ============ TRIPS HOOKS ============

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.get('/api/protected/trips'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 1 * 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId],
    queryFn: () => apiClient.get(`/api/protected/trips/${tripId}`),
    staleTime: 10 * 60 * 1000,
    gcTime: 1 * 60 * 60 * 1000,
    retry: 2,
    enabled: !!tripId, // Only fetch if tripId is provided
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiClient.post('/api/protected/trips', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

// ============ PROFILE HOOKS ============

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/api/protected/me'),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 1 * 60 * 60 * 1000,
    retry: 2,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiClient.put('/api/protected/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Install dependencies:
 *    npm install @tanstack/react-query
 * 
 * 2. Update app/layout.tsx:
 *    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 *    
 *    const queryClient = new QueryClient();
 *    
 *    export default function RootLayout({ children }) {
 *      return (
 *        <html>
 *          <body>
 *            <QueryClientProvider client={queryClient}>
 *              <ErrorBoundary>
 *                <AuthProvider>
 *                  {children}
 *                </AuthProvider>
 *              </ErrorBoundary>
 *            </QueryClientProvider>
 *          </body>
 *        </html>
 *      );
 *    }
 * 
 * 3. Use in components:
 *    import { useHealthMetrics } from '@/hooks/react-query';
 *    
 *    function HealthPage() {
 *      const { data, isLoading, error } = useHealthMetrics();
 *      
 *      if (isLoading) return <LoadingSkeleton />;
 *      if (error) return <ErrorState />;
 *      
 *      return <HealthDisplay metrics={data} />;
 *    }
 */

// For now, export empty object as placeholder
export {};
