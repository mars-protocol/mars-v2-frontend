import useAllAssets from 'hooks/assets/useAllAssets'

export default function usePerpsEnabledAssets() {
  const { data: assets } = useAllAssets()

  return assets.filter((asset) => asset.isPerpsEnabled)
}
