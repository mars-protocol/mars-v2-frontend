import useChainConfig from 'chain/useChainConfig'
import { useMemo } from 'react'
import useAssets from './useAssets'

export default function useBaseAsset() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

  return useMemo(
    () =>
      assets.find((asset) => asset.denom === chainConfig.defaultCurrency.coinMinimalDenom) ??
      assets[0],
    [assets, chainConfig.defaultCurrency.coinMinimalDenom],
  )
}
