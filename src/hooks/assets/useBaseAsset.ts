import baseAssets from 'constants/baseAssets'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'

export default function useBaseAsset() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

  return useMemo(
    () =>
      assets.find((asset) => asset.denom === chainConfig.defaultCurrency.coinMinimalDenom) ??
      baseAssets[chainConfig.id],
    [assets, chainConfig.defaultCurrency.coinMinimalDenom, chainConfig.id],
  )
}
