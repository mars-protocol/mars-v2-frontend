jest.mock('store', () => {
  let state = {}

  const mockUseStore = (selectorFn) => {
    return selectorFn(state)
  }

  mockUseStore.setState = (newState) => {
    state = {
      ...state,
      ...newState,
    }
  }

  mockUseStore.clearState = () => {
    state = {}
  }

  return {
    __esModule: true,
    default: mockUseStore,
  }
})
