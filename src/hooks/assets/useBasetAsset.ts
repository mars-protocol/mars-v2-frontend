import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function useBaseAsset() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

  return (
    assets.find((asset) => asset.denom === chainConfig.defaultCurrency.coinMinimalDenom) ??
    assets[0]
  )
}
