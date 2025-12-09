import useStore from 'store'

export function setApiError(api: string, error: unknown) {
  const errorStore = useStore.getState().errorStore
  useStore.setState({
    errorStore: {
      apiError: {
        api,
        message: error instanceof Error ? error.message : 'Unknown Error',
      },
      nodeError: errorStore.nodeError,
    },
  })
}

export function setNodeError(api: string, error: unknown) {
  const errorStore = useStore.getState().errorStore
  useStore.setState({
    errorStore: {
      apiError: errorStore.apiError,
      nodeError: {
        api,
        message: error instanceof Error ? error.message : 'Unknown Error',
      },
    },
  })
}

export function logApiError(url: string, error: unknown, context?: string) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.group(`API Error: ${url}`)
  console.error(`Error message: ${errorMessage}`)
  if (errorStack) console.error(`Stack trace: ${errorStack}`)
  if (context) console.error(`Context: ${context}`)

  if (error instanceof Response) {
    console.error(`Status: ${error.status} ${error.statusText}`)
  }

  console.groupEnd()
}

function isRetryableError(error: string): boolean {
  const lowerError = error.toLowerCase()
  return (
    lowerError.includes('unknown request') ||
    lowerError.includes('code = unknown') ||
    lowerError.includes('generic error')
  )
}

// Generic retry helper for unknown errors
export async function retryOnUnknownError<T>(
  fn: () => Promise<T>,
  maxRetries = 1,
  delay = 250,
): Promise<T> {
  const handleRetry = async (attempt: number) => {
    process.env.NODE_ENV !== 'production' &&
      console.warn(
        `[Retry] Unknown error detected, retrying... (attempt ${attempt + 1}/${maxRetries + 1})`,
      )
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn()
      const error = (result as { error?: unknown })?.error
      const errorString = error ? String(error) : ''

      if (errorString && isRetryableError(errorString) && attempt < maxRetries) {
        await handleRetry(attempt)
        continue
      }

      return result
    } catch (ex) {
      const errorString = String(ex)
      if (isRetryableError(errorString) && attempt < maxRetries) {
        await handleRetry(attempt)
        continue
      }
      throw ex
    }
  }
  throw new Error('Max retries exceeded')
}
