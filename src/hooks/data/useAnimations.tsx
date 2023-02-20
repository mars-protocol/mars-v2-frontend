import { useEffect } from 'react'

import { useSettingsStore } from 'store/useSettingsStore'

export const useAnimations = () => {
  const enableAnimations = useSettingsStore((s) => s.enableAnimations)

  const queryChangeHandler = (event: MediaQueryListEvent) => {
    useSettingsStore.setState({ enableAnimations: !event?.matches ?? true })
  }

  useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (mediaQuery) {
      useSettingsStore.setState({ enableAnimations: !mediaQuery.matches })
      mediaQuery.addEventListener('change', queryChangeHandler)
      return () => mediaQuery.removeEventListener('change', queryChangeHandler)
    }
  }, [])

  return enableAnimations
}
