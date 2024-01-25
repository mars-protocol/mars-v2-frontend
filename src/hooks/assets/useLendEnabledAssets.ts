import useStore from 'store'

export default function useLendEnabledAssets() {
  const assets = useStore((s) => s.chainConfig.assets)

  return assets.filter((asset) => asset.isAutoLendEnabled)
}
