import useAllAssets from 'hooks/assets/useAllAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useBaseAsset() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAllAssets()

  return (
    assets.find((asset) => asset.denom === chainConfig.defaultCurrency.coinMinimalDenom) ??
    assets[0]
  )
}
