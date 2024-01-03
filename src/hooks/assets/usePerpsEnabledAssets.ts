import useStore from 'store'

export default function usePerpsEnabledAssets() {
  const assets = useStore((s) => s.chainConfig.assets)

  return assets.filter((asset) => asset.isPerpsEnabled)
}
