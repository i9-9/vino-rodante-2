"use client"

import { useState, useCallback } from "react"

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showProgress?: boolean
}

interface AsyncOperationState {
  isLoading: boolean
  progress: number
  error: Error | null
  data: any
}

export function useAsyncOperation<T = any>(options: UseAsyncOperationOptions = {}) {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    progress: 0,
    error: null,
    data: null,
  })

  const execute = useCallback(async (
    operation: (onProgress?: (progress: number) => void) => Promise<T>
  ) => {
    setState({
      isLoading: true,
      progress: 0,
      error: null,
      data: null,
    })

    try {
      const onProgress = options.showProgress 
        ? (progress: number) => {
            setState(prev => ({ ...prev, progress }))
          }
        : undefined

      const result = await operation(onProgress)

      setState({
        isLoading: false,
        progress: 100,
        error: null,
        data: result,
      })

      options.onSuccess?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      setState({
        isLoading: false,
        progress: 0,
        error: err,
        data: null,
      })

      options.onError?.(err)
      throw err
    }
  }, [options])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      error: null,
      data: null,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

