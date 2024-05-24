import useAllAssets from 'hooks/assets/useAllAssets'

export default function useBorrowEnabledAssets() {
  const { data: assets } = useAllAssets()

  return assets.filter((asset) => asset.isBorrowEnabled)
}
