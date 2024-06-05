import useAssets from 'hooks/assets/useAssets'
import { useMemo } from 'react'
import { byDenom, bySymbol } from 'utils/array'

export default function useAsset(denomOrSymbol: string) {
  const { data: assets } = useAssets()

  return useMemo(
    () => assets.find(byDenom(denomOrSymbol)) ?? assets.find(bySymbol(denomOrSymbol)),
    [assets],
  )
}
