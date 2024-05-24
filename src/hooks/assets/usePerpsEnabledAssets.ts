import useAssets from 'hooks/assets/useAssets'

export default function usePerpsEnabledAssets() {
  const { data: assets } = useAssets()

  return assets.filter((asset) => asset.isPerpsEnabled)
}
