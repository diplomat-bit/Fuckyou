import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResult<T, Args extends any[]> extends ApiState<T> {
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
}

export function useApi<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiResult<T, Args> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState((prevState) => ({ ...prevState, loading: true, error: null }));
      
      try {
        const data = await apiFunction(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const parsedError = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: parsedError });
        throw parsedError;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useApi;