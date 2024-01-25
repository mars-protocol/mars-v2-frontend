import useStore from 'store'

export default function useBorrowEnabledAssets() {
  const assets = useStore((s) => s.chainConfig.assets)

  return assets.filter((asset) => asset.isBorrowEnabled)
}
