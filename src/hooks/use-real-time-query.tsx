import { useEffect } from 'react';
import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type SupabaseTable = 'links' | 'link_clicks' | 'users';

interface UseRealTimeQueryOptions {
  table: SupabaseTable;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValue?: string | number;
  refetchInterval?: number | false;
}

/**
 * Custom hook that adds real-time capabilities to React Query
 * It subscribes to Supabase real-time changes and automatically refetches data
 */
export function useRealTimeQuery<TData>(
  queryResult: UseQueryResult<TData, Error>,
  options: UseRealTimeQueryOptions
): UseQueryResult<TData, Error> {
  const { table, event = '*', filter, filterValue, refetchInterval = false } = options;
  const queryClient = useQueryClient();
  const { queryKey } = queryResult;

  useEffect(() => {
    // Set up refetch interval if specified
    if (refetchInterval && typeof refetchInterval === 'number') {
      const intervalId = setInterval(() => {
        queryResult.refetch();
      }, refetchInterval);

      return () => clearInterval(intervalId);
    }

    // Set up real-time subscription
    let subscription: RealtimeChannel;

    const setupSubscription = async () => {
      let channel = supabase.channel(`${table}-changes`);

      // Configure the subscription based on options
      let config = {
        event,
        schema: 'public',
        table,
      };

      // Add filter if provided
      if (filter && filterValue !== undefined) {
        config = {
          ...config,
          filter: `${filter}=eq.${filterValue}`,
        };
      }

      // Subscribe to changes
      subscription = channel
        .on('postgres_changes', config, () => {
          // Invalidate and refetch the query when data changes
          queryClient.invalidateQueries({ queryKey });
        })
        .subscribe();
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [queryClient, queryKey, queryResult, table, event, filter, filterValue, refetchInterval]);

  return queryResult;
}