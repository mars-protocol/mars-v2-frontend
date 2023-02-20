import { useEffect } from 'react'

import useStore from 'store'

export const useAnimations = () => {
  const enableAnimations = useStore((s) => s.enableAnimations)

  const queryChangeHandler = (event: MediaQueryListEvent) => {
    useStore.setState({ enableAnimations: !event?.matches ?? true })
  }

  useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (mediaQuery) {
      useStore.setState({ enableAnimations: !mediaQuery.matches })
      mediaQuery.addEventListener('change', queryChangeHandler)
      return () => mediaQuery.removeEventListener('change', queryChangeHandler)
    }
  }, [])

  return enableAnimations
}
