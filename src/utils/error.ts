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
