import { useEffect } from 'react'
import { useSettings } from 'stores'

export const useAnimations = () => {
  const enableAnimations = useSettings((s) => s.enableAnimations)

  const queryChangeHandler = (event: MediaQueryListEvent) => {
    useSettings.setState({ enableAnimations: !event?.matches ?? true })
  }

  useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (mediaQuery) {
      useSettings.setState({ enableAnimations: !mediaQuery.matches })
      mediaQuery.addEventListener('change', queryChangeHandler)
      return () => mediaQuery.removeEventListener('change', queryChangeHandler)
    }
  }, [])

  return enableAnimations
}
