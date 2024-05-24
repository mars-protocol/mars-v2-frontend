import useAssets from 'hooks/assets/useAssets'

export default function useBorrowEnabledAssets() {
  const { data: assets } = useAssets()

  return assets.filter((asset) => asset.isBorrowEnabled)
}
