import { useState, useEffect } from 'react';

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useQuery<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: { enabled?: boolean }
): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (options?.enabled === false) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [key, options?.enabled]);

  return { data, isLoading, error };
}