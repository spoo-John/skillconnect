import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { errorMessage } from '../api/client'

export type AsyncState<T> =
  | { status: 'loading'; data?: T; error?: undefined }
  | { status: 'ready'; data: T; error?: undefined }
  | { status: 'error'; data?: T; error: string }

/**
 * Runs an async loader on mount and whenever `deps` change; aborts stale requests.
 * Every data view uses this, so loading / error / retry behave the same everywhere.
 */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    setState((s) => ({ status: 'loading', data: s.data }))
    load(ctrl.signal).then(
      (data) => !ctrl.signal.aborted && setState({ status: 'ready', data }),
      (err) => !ctrl.signal.aborted && setState((s) => ({ status: 'error', data: s.data, error: errorMessage(err) }))
    )
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  /** Update loaded data locally (e.g. after a delete) without refetching. */
  const mutate = useCallback((update: (data: T) => T) => {
    setState((s) => (s.status === 'ready' ? { status: 'ready', data: update(s.data) } : s))
  }, [])

  return { ...state, retry, mutate }
}
