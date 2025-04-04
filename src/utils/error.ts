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
