import useAllAssets from 'hooks/assets/useAllAssets'

export default function useBorrowEnabledAssets() {
  const assets = useAllAssets()

  return assets.filter((asset) => asset.isBorrowEnabled)
}
