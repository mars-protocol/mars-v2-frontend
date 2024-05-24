import useAllAssets from 'hooks/assets/useAllAssets'

export default function useLendEnabledAssets() {
  const { data: assets } = useAllAssets()

  return assets.filter((asset) => asset.isAutoLendEnabled)
}
