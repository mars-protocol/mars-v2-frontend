import useStore from 'store'

export default function useMarketEnabledAssets() {
  const assets = useStore((s) => s.chainConfig.assets)
  return assets.filter((asset) => asset.isEnabled && asset.isMarket)
}
