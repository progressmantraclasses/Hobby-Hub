import { useCallback, useRef, useState } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

const IDLE_STATE = { status: 'idle' as const, data: null, error: null };

export function useAsyncTask<Args extends unknown[], T>(task: (...args: Args) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>(IDLE_STATE);
  const requestId = useRef(0);

  const run = useCallback(
    async (...args: Args) => {
      const id = ++requestId.current;
      setState({ status: 'loading', data: null, error: null });
      try {
        const data = await task(...args);
        if (id === requestId.current) setState({ status: 'success', data, error: null });
        return data;
      } catch (err) {
        if (id === requestId.current) {
          const message = err instanceof Error ? err.message : 'Something went wrong';
          setState({ status: 'error', data: null, error: message });
        }
        throw err;
      }
    },
    [task]
  );

  const reset = useCallback(() => {
    requestId.current++;
    setState(IDLE_STATE);
  }, []);

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    run,
    reset,
  };
}
