import { useCallback, useEffect } from 'react'

import { ENABLE_ANIMATIONS_KEY } from 'constants/localStore'
import useStore from 'store'

export const useAnimations = () => {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const enableAnimationsLocalStorage =
    typeof window !== 'undefined' ? window.localStorage.getItem(ENABLE_ANIMATIONS_KEY) : false

  const queryChangeHandler = useCallback(
    (event: MediaQueryListEvent) => {
      if (enableAnimationsLocalStorage) return
      useStore.setState({ enableAnimations: !event?.matches ?? true })
    },
    [enableAnimationsLocalStorage],
  )

  useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    const storeSetting = enableAnimationsLocalStorage === 'true'
    useStore.setState({ enableAnimations: storeSetting })

    if (mediaQuery) {
      if (enableAnimationsLocalStorage) return
      useStore.setState({ enableAnimations: !mediaQuery.matches })
      mediaQuery.addEventListener('change', queryChangeHandler)
      return () => mediaQuery.removeEventListener('change', queryChangeHandler)
    }
  }, [enableAnimations, enableAnimationsLocalStorage, queryChangeHandler])

  return enableAnimations
}
