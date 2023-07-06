import { useEffect } from 'react'

import { LEND_ASSETS_KEY } from 'constants/localStore'
import useStore from 'store'

export const useLendAssets = () => {
  const lendAssets = useStore((s) => s.lendAssets)
  const lendAssetsLocalStorage =
    typeof window !== 'undefined' ? window.localStorage.getItem(LEND_ASSETS_KEY) : null

  useEffect(() => {
    if (lendAssetsLocalStorage === null) {
      window.localStorage.setItem(LEND_ASSETS_KEY, 'true')
    }
  }, [lendAssetsLocalStorage])

  return lendAssets
}
