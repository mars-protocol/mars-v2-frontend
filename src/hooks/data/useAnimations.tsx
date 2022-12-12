import { useEffect, useState } from 'react'

export const useAnimations = () => {
  const [enableAnimations, setEnableAnimations] = useState(true)

  const queryChangeHandler = (event: MediaQueryListEvent) => {
    setEnableAnimations(!event?.matches ?? true)
  }

  useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (mediaQuery) {
      setEnableAnimations(!mediaQuery.matches)

      mediaQuery.addEventListener('change', queryChangeHandler)
      return () => mediaQuery.removeEventListener('change', queryChangeHandler)
    }
  }, [])

  return enableAnimations
}
